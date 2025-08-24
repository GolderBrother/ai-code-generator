import { Injectable, Logger } from '@nestjs/common';
import { AiModelMetricsCollector } from './ai-model-metrics.collector';
import { MonitorContext, MonitorContextHolder } from './interfaces/monitor-context.interface';

/**
 * AI模型监听器（对应Java的AiModelMonitorListener）
 */
@Injectable()
export class AiModelMonitorListener {
  private readonly logger = new Logger(AiModelMonitorListener.name);
  
  // 用于存储请求开始时间的键
  private static readonly REQUEST_START_TIME_KEY = 'request_start_time';
  // 用于监控上下文传递
  private static readonly MONITOR_CONTEXT_KEY = 'monitor_context';
  
  // 存储请求属性的Map
  private readonly requestAttributes = new Map<string, Map<string, any>>();

  constructor(private readonly aiModelMetricsCollector: AiModelMetricsCollector) {}

  /**
   * 请求开始时调用
   */
  onRequest(requestId: string, modelName: string, userId?: string, appId?: string): void {
    try {
      // 创建请求属性存储
      const attributes = new Map<string, any>();
      attributes.set(AiModelMonitorListener.REQUEST_START_TIME_KEY, Date.now());
      
      // 获取或创建监控上下文
      let monitorContext: MonitorContext;
      if (userId && appId) {
        monitorContext = { userId, appId };
      } else {
        // 尝试从上下文持有者获取
        const existingContext = MonitorContextHolder.getContext(requestId);
        monitorContext = existingContext || { userId: 'unknown', appId: 'unknown' };
      }
      
      // 设置监控上下文
      MonitorContextHolder.setContext(requestId, monitorContext);
      attributes.set(AiModelMonitorListener.MONITOR_CONTEXT_KEY, monitorContext);
      
      // 存储请求属性
      this.requestAttributes.set(requestId, attributes);
      
      // 记录请求指标
      this.aiModelMetricsCollector.recordRequest(
        monitorContext.userId,
        monitorContext.appId,
        modelName,
        'started'
      );
      
      this.logger.debug(`Request started: ${requestId}, model: ${modelName}`);
    } catch (error) {
      this.logger.error(`Error in onRequest: ${error.message}`, error.stack);
    }
  }

  /**
   * 请求成功响应时调用
   */
  onResponse(
    requestId: string,
    modelName: string,
    inputTokens?: number,
    outputTokens?: number,
    totalTokens?: number
  ): void {
    try {
      // 获取请求属性
      const attributes = this.requestAttributes.get(requestId);
      if (!attributes) {
        this.logger.warn(`No attributes found for request: ${requestId}`);
        return;
      }

      // 从监控上下文中获取信息
      const context = attributes.get(AiModelMonitorListener.MONITOR_CONTEXT_KEY) as MonitorContext;
      if (!context) {
        this.logger.warn(`No monitor context found for request: ${requestId}`);
        return;
      }

      const { userId, appId } = context;

      // 记录成功请求
      this.aiModelMetricsCollector.recordRequest(userId, appId, modelName, 'success');

      // 记录响应时间
      this.recordResponseTime(attributes, userId, appId, modelName);

      // 记录Token使用情况
      this.recordTokenUsage(userId, appId, modelName, inputTokens, outputTokens, totalTokens);

      // 清理请求属性
      this.requestAttributes.delete(requestId);
      MonitorContextHolder.clearContext(requestId);

      this.logger.debug(`Request completed successfully: ${requestId}`);
    } catch (error) {
      this.logger.error(`Error in onResponse: ${error.message}`, error.stack);
    }
  }

  /**
   * 请求错误时调用
   */
  onError(requestId: string, modelName: string, errorMessage: string): void {
    try {
      // 获取请求属性
      const attributes = this.requestAttributes.get(requestId);
      
      // 获取监控上下文
      let context: MonitorContext;
      if (attributes) {
        context = attributes.get(AiModelMonitorListener.MONITOR_CONTEXT_KEY) as MonitorContext;
      }
      
      if (!context) {
        // 尝试从上下文持有者获取
        context = MonitorContextHolder.getContext(requestId) || { userId: 'unknown', appId: 'unknown' };
      }

      const { userId, appId } = context;

      // 记录失败请求
      this.aiModelMetricsCollector.recordRequest(userId, appId, modelName, 'error');
      this.aiModelMetricsCollector.recordError(userId, appId, modelName, errorMessage);

      // 记录响应时间（即使是错误响应）
      if (attributes) {
        this.recordResponseTime(attributes, userId, appId, modelName);
      }

      // 清理请求属性
      this.requestAttributes.delete(requestId);
      MonitorContextHolder.clearContext(requestId);

      this.logger.error(`Request failed: ${requestId}, error: ${errorMessage}`);
    } catch (error) {
      this.logger.error(`Error in onError: ${error.message}`, error.stack);
    }
  }

  /**
   * 记录响应时间
   */
  private recordResponseTime(
    attributes: Map<string, any>,
    userId: string,
    appId: string,
    modelName: string
  ): void {
    const startTime = attributes.get(AiModelMonitorListener.REQUEST_START_TIME_KEY) as number;
    if (startTime) {
      const responseTime = Date.now() - startTime;
      this.aiModelMetricsCollector.recordResponseTime(userId, appId, modelName, responseTime);
    }
  }

  /**
   * 记录Token使用情况
   */
  private recordTokenUsage(
    userId: string,
    appId: string,
    modelName: string,
    inputTokens?: number,
    outputTokens?: number,
    totalTokens?: number
  ): void {
    if (inputTokens !== undefined) {
      this.aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, 'input', inputTokens);
    }
    if (outputTokens !== undefined) {
      this.aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, 'output', outputTokens);
    }
    if (totalTokens !== undefined) {
      this.aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, 'total', totalTokens);
    }
  }

  /**
   * 设置监控上下文（供外部调用）
   */
  setMonitorContext(requestId: string, userId: string, appId: string): void {
    const context: MonitorContext = { userId, appId };
    MonitorContextHolder.setContext(requestId, context);
  }

  /**
   * 清理所有上下文（用于应用关闭时清理）
   */
  clearAllContexts(): void {
    this.requestAttributes.clear();
    MonitorContextHolder.clearAllContexts();
  }
}