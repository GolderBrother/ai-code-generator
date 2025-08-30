import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';
import { CodeGenTypeEnum } from '../../common/enums/code-gen-type.enum';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AI 代码生成类型路由服务
 * 完全对齐 Java 版本的 AiCodeGenTypeRoutingService
 */
@Injectable()
export class AiCodeGenTypeRoutingService {
  private readonly logger = new Logger(AiCodeGenTypeRoutingService.name);
  private readonly chatModel: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    // 初始化 OpenAI 模型 - 对齐 Java 版本的配置
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    const modelName = this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-3.5-turbo');

    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      configuration: {
        baseURL: baseURL,
      },
      modelName: modelName,
      temperature: 0.1, // 降低温度以获得更一致的路由结果
      maxTokens: 500,   // 路由决策不需要太多 token
    });
  }

  /**
   * 根据用户输入智能选择代码生成类型
   * 完全对齐 Java 版本的 routeCodeGenType 方法
   */
  async routeCodeGenType(userPrompt: string): Promise<CodeGenTypeEnum> {
    try {
      const systemPrompt = await this.loadRoutingPrompt();
      
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const response = await this.chatModel.invoke(messages);
      const responseContent = (response.content as string).trim().toLowerCase();

      // 解析 AI 的路由决策 - 对齐 Java 版本的解析逻辑
      const selectedType = this.parseRoutingResponse(responseContent);
      
      this.logger.log(`AI 路由决策: ${userPrompt} -> ${selectedType}`);
      
      return selectedType;
    } catch (error) {
      this.logger.error(`AI 路由决策失败: ${error.message}`, error.stack);
      // 降级到规则路由 - 对齐 Java 版本的降级策略
      return this.fallbackRouting(userPrompt);
    }
  }

  /**
   * 加载路由提示词
   * 对齐 Java 版本的 @SystemMessage(fromResource = "prompt/codegen-routing-system-prompt.txt")
   */
  private async loadRoutingPrompt(): Promise<string> {
    try {
      const promptPath = path.join(process.cwd(), 'src', 'resources', 'prompt', 'codegen-routing-system-prompt.txt');
      
      if (fs.existsSync(promptPath)) {
        const promptContent = fs.readFileSync(promptPath, 'utf-8');
        return promptContent.trim();
      }
    } catch (error) {
      this.logger.warn('加载路由提示词文件失败，使用默认提示词');
    }

    // 默认路由提示词
    return `你是一个专业的代码生成路由器，需要根据用户的需求选择最合适的代码生成类型。

可选的代码生成类型：
1. HTML - 适用于简单的单页面应用、展示页面、静态网站
2. MULTI_FILE - 适用于需要多个文件的Web项目，包含HTML、CSS、JS分离的项目
3. VUE_PROJECT - 适用于复杂的单页应用、组件化项目、需要Vue框架的项目

请根据用户需求分析：
- 如果用户提到"简单页面"、"展示"、"静态"、"单页"，选择 HTML
- 如果用户提到"多文件"、"分离"、"模块化"、"CSS文件"、"JS文件"，选择 MULTI_FILE  
- 如果用户提到"Vue"、"组件"、"单页应用"、"SPA"、"复杂交互"、"数据绑定"，选择 VUE_PROJECT

请只返回类型名称：HTML、MULTI_FILE 或 VUE_PROJECT

用户需求：`;
  }

  /**
   * 解析路由响应
   * 对齐 Java 版本的响应解析逻辑
   */
  private parseRoutingResponse(responseContent: string): CodeGenTypeEnum {
    const content = responseContent.toLowerCase().trim();

    // 优先匹配完整类型名
    if (content.includes('vue_project') || content.includes('vue-project') || content.includes('vueproject')) {
      return CodeGenTypeEnum.VUE_PROJECT;
    }
    
    if (content.includes('multi_file') || content.includes('multi-file') || content.includes('multifile')) {
      return CodeGenTypeEnum.MULTI_FILE;
    }
    
    if (content.includes('html')) {
      return CodeGenTypeEnum.HTML;
    }

    // 关键词匹配
    if (content.includes('vue') || content.includes('组件') || content.includes('单页应用') || content.includes('spa')) {
      return CodeGenTypeEnum.VUE_PROJECT;
    }
    
    if (content.includes('多文件') || content.includes('分离') || content.includes('css') || content.includes('js')) {
      return CodeGenTypeEnum.MULTI_FILE;
    }

    // 默认返回 HTML
    return CodeGenTypeEnum.HTML;
  }

  /**
   * 降级路由策略
   * 对齐 Java 版本的降级逻辑
   */
  private fallbackRouting(userPrompt: string): CodeGenTypeEnum {
    const prompt = userPrompt.toLowerCase();

    // 简单的规则匹配 - 对齐 Java 版本的规则路由
    if (prompt.includes('vue') || prompt.includes('组件') || prompt.includes('单页应用')) {
      return CodeGenTypeEnum.VUE_PROJECT;
    }
    
    if (prompt.includes('多文件') || prompt.includes('css') || prompt.includes('js') || prompt.includes('分离')) {
      return CodeGenTypeEnum.MULTI_FILE;
    }

    // 默认返回 HTML
    this.logger.log(`使用降级路由策略，默认选择 HTML 类型`);
    return CodeGenTypeEnum.HTML;
  }
}

/**
 * AI 代码生成类型路由服务工厂
 * 完全对齐 Java 版本的 AiCodeGenTypeRoutingServiceFactory
 */
@Injectable()
export class AiCodeGenTypeRoutingServiceFactory {
  private readonly logger = new Logger(AiCodeGenTypeRoutingServiceFactory.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * 创建 AI 代码生成类型路由服务实例
   * 对齐 Java 版本的多例模式
   */
  createAiCodeGenTypeRoutingService(): AiCodeGenTypeRoutingService {
    const service = new AiCodeGenTypeRoutingService(this.configService);
    this.logger.debug('创建新的 AI 代码生成类型路由服务实例');
    return service;
  }
}