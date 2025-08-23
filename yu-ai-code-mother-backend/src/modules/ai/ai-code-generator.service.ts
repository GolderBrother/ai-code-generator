import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { loadSystemPrompt } from '../../utils/prompt-loader';
import { ToolManager } from './tools/tool-manager';

export interface CodeGenerationRequest {
  prompt: string;
  codeType: 'html' | 'multi-file' | 'react' | 'vue';
  framework?: string;
  features?: string[];
}

export interface CodeGenerationResult {
  success: boolean;
  code?: any;
  error?: string;
  metadata?: {
    tokensUsed: number;
    model: string;
    timestamp: Date;
  };
}

@Injectable()
export class AiCodeGeneratorService {
  private readonly openai: ChatOpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolManager: ToolManager,
  ) {
    this.openai = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      modelName: this.configService.get('OPENAI_MODEL', 'gpt-4'),
      temperature: 0.3,
      maxTokens: 8000,
    });
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    try {
      const systemPrompt = await this.getSystemPrompt(request.codeType);
      const prompt = PromptTemplate.fromTemplate(systemPrompt);
      
      const chain = prompt.pipe(this.openai);
      const response = await chain.invoke({
        userPrompt: request.prompt,
        codeType: request.codeType,
        framework: request.framework,
        features: request.features?.join(', '),
      });
      
      const parsedCode = this.parseCodeResponse(response.content as string, request.codeType);
      
      return {
        success: true,
        code: parsedCode,
        metadata: {
          tokensUsed: 0, // OpenAI API 响应中可能没有usage信息
          model: this.openai.modelName,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async getSystemPrompt(codeType: string): Promise<string> {
    const promptMap = {
      'html': 'codegen-html-system-prompt.txt',
      'multi-file': 'codegen-multi-file-system-prompt.txt',
      'react': 'codegen-react-system-prompt.txt',
      'vue': 'codegen-vue-system-prompt.txt',
    };
    
    const promptFile = promptMap[codeType] || 'codegen-multi-file-system-prompt.txt';
    return await loadSystemPrompt(promptFile);
  }

  private parseCodeResponse(content: string, codeType: string): any {
    switch (codeType) {
      case 'html':
        return this.parseHtmlCode(content);
      case 'multi-file':
        return this.parseMultiFileCode(content);
      case 'react':
        return this.parseReactCode(content);
      case 'vue':
        return this.parseVueCode(content);
      default:
        return this.parseMultiFileCode(content);
    }
  }

  private parseHtmlCode(content: string): any {
    return {
      html: content,
      css: '',
      javascript: '',
    };
  }

  private parseMultiFileCode(content: string): any {
    return {
      files: [
        {
          path: 'index.html',
          content: content,
        },
      ],
    };
  }

  private parseReactCode(content: string): any {
    return {
      files: [
        {
          path: 'App.jsx',
          content: content,
        },
      ],
    };
  }

  private parseVueCode(content: string): any {
    return {
      files: [
        {
          path: 'App.vue',
          content: content,
        },
      ],
    };
  }
}