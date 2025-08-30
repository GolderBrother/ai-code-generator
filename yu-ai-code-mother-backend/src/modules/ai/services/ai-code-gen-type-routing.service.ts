import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';

/**
 * AI 代码生成类型路由服务
 * 完全对齐 Java 版本的智能类型选择功能
 */
@Injectable()
export class AiCodeGenTypeRoutingService {
  private readonly logger = new Logger(AiCodeGenTypeRoutingService.name);
  private readonly chatModel: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    // 初始化轻量级模型用于类型判断
    this.chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1, // 低温度确保结果稳定
    });
  }

  /**
   * 根据用户需求智能选择代码生成类型
   * 对齐 Java 版本的智能路由功能
   */
  async determineCodeGenType(userMessage: string): Promise<CodeGenTypeEnum> {
    const systemPrompt = this.getTypeRoutingSystemPrompt();
    
    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ];

      const response = await this.chatModel.invoke(messages);
      const result = (response.content as string).trim().toUpperCase();
      
      // 解析 AI 返回的类型
      switch (result) {
        case 'HTML':
          return CodeGenTypeEnum.HTML;
        case 'MULTI_FILE':
          return CodeGenTypeEnum.MULTI_FILE;
        case 'VUE_PROJECT':
          return CodeGenTypeEnum.VUE_PROJECT;
        default:
          this.logger.warn(`AI 返回了未知的类型: ${result}，使用默认类型 HTML`);
          return CodeGenTypeEnum.HTML;
      }
    } catch (error) {
      this.logger.error(`代码生成类型判断失败: ${error.message}`, error.stack);
      // 出错时返回默认类型
      return CodeGenTypeEnum.HTML;
    }
  }

  /**
   * 获取类型路由系统提示词
   * 对齐 Java 版本的智能分析逻辑
   */
  private getTypeRoutingSystemPrompt(): string {
    return `你是一个专业的技术架构师，请根据用户的需求描述，判断应该生成什么类型的代码项目。

可选的代码生成类型：
1. HTML - 单个 HTML 文件，适用于简单的静态页面、展示页面、落地页等
2. MULTI_FILE - 多文件项目，适用于需要多个文件的复杂项目，如包含 HTML、CSS、JS 的完整前端项目
3. VUE_PROJECT - Vue.js 项目，适用于需要现代化前端框架的复杂应用

判断规则：
- 如果用户只是要一个简单的页面、展示内容，选择 HTML
- 如果用户需要一个包含多个文件的项目，但不特别要求框架，选择 MULTI_FILE  
- 如果用户明确提到 Vue、组件化、SPA、现代化前端应用等，选择 VUE_PROJECT

请仔细分析用户需求，只返回以下三个选项之一：HTML、MULTI_FILE、VUE_PROJECT

不要返回任何解释，只返回类型名称。`;
  }
}

/**
 * AI 代码生成类型路由服务工厂
 * 对齐 Java 版本的工厂模式
 */
@Injectable()
export class AiCodeGenTypeRoutingServiceFactory {
  constructor(
    private readonly aiCodeGenTypeRoutingService: AiCodeGenTypeRoutingService,
  ) {}

  /**
   * 获取类型路由服务实例
   */
  getAiCodeGenTypeRoutingService(): AiCodeGenTypeRoutingService {
    return this.aiCodeGenTypeRoutingService;
  }
}