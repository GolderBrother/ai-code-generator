import { Injectable, Logger } from '@nestjs/common';
import { AiCodeGeneratorService } from './services/ai-code-generator.service';
import { CodeGenTypeEnum } from '../../common/enums/code-gen-type.enum';

/**
 * AI 代码生成服务工厂
 * 完全对齐 Java 版本的 AiCodeGeneratorServiceFactory
 */
@Injectable()
export class AiCodeGeneratorServiceFactory {
  private readonly logger = new Logger(AiCodeGeneratorServiceFactory.name);
  
  // 服务实例缓存 - 对齐 Java 版本的多例模式
  private readonly serviceCache = new Map<string, AiCodeGeneratorService>();

  constructor(
    private readonly aiCodeGeneratorService: AiCodeGeneratorService,
  ) {}

  /**
   * 根据 appId 和代码生成类型获取 AI 服务实例
   * 完全对齐 Java 版本的 getAiCodeGeneratorService 方法
   */
  getAiCodeGeneratorService(appId: number, codeGenTypeEnum: CodeGenTypeEnum): AiCodeGeneratorService {
    // 生成缓存键 - 对齐 Java 版本的缓存策略
    const cacheKey = `${appId}_${codeGenTypeEnum}`;
    
    // 检查缓存
    if (this.serviceCache.has(cacheKey)) {
      const cachedService = this.serviceCache.get(cacheKey);
      this.logger.debug(`从缓存获取 AI 服务实例: ${cacheKey}`);
      return cachedService!;
    }

    // 创建新的服务实例 - 对齐 Java 版本的多例模式
    const serviceInstance = this.createServiceInstance(appId, codeGenTypeEnum);
    
    // 缓存服务实例
    this.serviceCache.set(cacheKey, serviceInstance);
    
    this.logger.log(`创建新的 AI 服务实例: ${cacheKey}`);
    return serviceInstance;
  }

  /**
   * 创建服务实例
   * 对齐 Java 版本的实例创建逻辑
   */
  private createServiceInstance(appId: number, codeGenTypeEnum: CodeGenTypeEnum): AiCodeGeneratorService {
    // 这里可以根据不同的类型创建不同配置的服务实例
    // 目前返回通用实例，后续可以扩展为不同类型的专用实例
    
    switch (codeGenTypeEnum) {
      case CodeGenTypeEnum.HTML:
        this.logger.debug(`创建 HTML 代码生成服务实例，appId: ${appId}`);
        break;
      case CodeGenTypeEnum.MULTI_FILE:
        this.logger.debug(`创建多文件代码生成服务实例，appId: ${appId}`);
        break;
      case CodeGenTypeEnum.VUE_PROJECT:
        this.logger.debug(`创建 Vue 项目代码生成服务实例，appId: ${appId}`);
        break;
      default:
        this.logger.warn(`未知的代码生成类型: ${codeGenTypeEnum}，使用默认服务实例`);
    }

    return this.aiCodeGeneratorService;
  }

  /**
   * 清理缓存
   * 对齐 Java 版本的资源管理
   */
  clearCache(): void {
    this.serviceCache.clear();
    this.logger.log('AI 服务实例缓存已清理');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.serviceCache.size,
      keys: Array.from(this.serviceCache.keys()),
    };
  }
}