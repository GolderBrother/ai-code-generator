import { Injectable, Logger } from '@nestjs/common';
import { AiCodeGeneratorService } from '../services/ai-code-generator.service';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';

/**
 * AI 代码生成服务工厂
 * 完全对齐 Java 版本的 Factory 模式
 */
@Injectable()
export class AiCodeGeneratorServiceFactory {
  private readonly logger = new Logger(AiCodeGeneratorServiceFactory.name);

  constructor(
    private readonly aiCodeGeneratorService: AiCodeGeneratorService,
  ) {}

  /**
   * 根据代码生成类型获取对应的服务实例
   * 对齐 Java 版本的工厂方法模式
   */
  getAiCodeGeneratorService(codeGenType: CodeGenTypeEnum): AiCodeGeneratorService {
    // 目前所有类型都使用同一个服务实例
    // 未来可以根据不同类型返回不同的专门化服务
    switch (codeGenType) {
      case CodeGenTypeEnum.HTML:
      case CodeGenTypeEnum.MULTI_FILE:
      case CodeGenTypeEnum.VUE_PROJECT:
        return this.aiCodeGeneratorService;
      default:
        this.logger.warn(`未知的代码生成类型: ${codeGenType}，使用默认服务`);
        return this.aiCodeGeneratorService;
    }
  }

  /**
   * 检查是否支持指定的代码生成类型
   * 对齐 Java 版本的类型检查功能
   */
  isSupported(codeGenType: CodeGenTypeEnum): boolean {
    return Object.values(CodeGenTypeEnum).includes(codeGenType);
  }

  /**
   * 获取所有支持的代码生成类型
   * 对齐 Java 版本的类型枚举功能
   */
  getSupportedTypes(): CodeGenTypeEnum[] {
    return Object.values(CodeGenTypeEnum);
  }
}