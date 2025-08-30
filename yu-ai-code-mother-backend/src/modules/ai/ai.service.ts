import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AI 服务 - 简化版本
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * 获取AI服务配置
   */
  getAiConfig() {
    return {
      model: this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo'),
      temperature: this.configService.get<number>('OPENAI_TEMPERATURE', 0.7),
      maxTokens: this.configService.get<number>('OPENAI_MAX_TOKENS', 2000),
    };
  }

  /**
   * 检查AI服务状态
   */
  async checkStatus(): Promise<boolean> {
    try {
      // 这里可以添加实际的AI服务健康检查逻辑
      return true;
    } catch (error) {
      this.logger.error(`AI服务状态检查失败: ${error.message}`, error.stack);
      return false;
    }
  }
}