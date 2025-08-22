import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { loadSystemPrompt } from '../../utils/prompt-loader';

export interface HtmlCodeResult {
  html: string;
  css: string;
  javascript: string;
}

export interface MultiFileCodeResult {
  files: Array<{
    path: string;
    content: string;
  }>;
}

@Injectable()
export class AiService {
  private readonly openai: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      modelName: this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
      temperature: 0.7,
      maxTokens: 4000,
    });
  }

  async generateHtmlCode(userMessage: string): Promise<HtmlCodeResult> {
    const systemPrompt = await loadSystemPrompt('codegen-html-system-prompt.txt');
    const prompt = PromptTemplate.fromTemplate(systemPrompt);
    
    const chain = prompt.pipe(this.openai);
    const response = await chain.invoke({ userMessage });
    
    return this.parseHtmlCodeResponse(response.content as string);
  }

  async generateMultiFileCode(userMessage: string): Promise<MultiFileCodeResult> {
    const systemPrompt = await loadSystemPrompt('codegen-multi-file-system-prompt.txt');
    const prompt = PromptTemplate.fromTemplate(systemPrompt);
    
    const chain = prompt.pipe(this.openai);
    const response = await chain.invoke({ userMessage });
    
    return this.parseMultiFileCodeResponse(response.content as string);
  }

  private parseHtmlCodeResponse(content: string): HtmlCodeResult {
    // 这里需要根据实际的 AI 响应格式来解析
    // 示例实现，实际需要根据具体的提示词和响应格式调整
    return {
      html: '<div>Generated HTML</div>',
      css: 'body { margin: 0; }',
      javascript: 'console.log("Generated JS");',
    };
  }

  private parseMultiFileCodeResponse(content: string): MultiFileCodeResult {
    // 解析多文件代码响应
    return {
      files: [
        {
          path: 'index.html',
          content: '<div>Generated HTML</div>',
        },
        {
          path: 'style.css',
          content: 'body { margin: 0; }',
        },
        {
          path: 'script.js',
          content: 'console.log("Generated JS");',
        },
      ],
    };
  }
}
