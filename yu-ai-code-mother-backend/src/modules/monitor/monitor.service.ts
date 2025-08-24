import { Injectable, Logger } from '@nestjs/common';
import { AiModelMetricsCollector } from './ai-model-metrics.collector';
import { AiModelMonitorListener } from './ai-model-monitor.listener';
import { MonitorContext, MonitorContextHolder } from './interfaces/monitor-context.interface';

export interface MonitorRequestContext {
  modelName: string;
  requestId: string;
  startTime: number;
  endTime?: number;
  tokenCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  success?: boolean;
  error?: string;
  userId?: string;
  appId?: string;
}

/**
 * 监控服务 - 统一的监控入口
 */
@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);
  private readonly contexts: Map<string, MonitorRequestContext> = new Map();

  constructor(
    private readonly aiModelMetricsCollector: AiModelMetricsCollector,
    private readonly aiModelMonitorListener: AiModelMonitorListener,
  ) {}

  /**
   * 设置监控上下文
   */
  setMonitorContext(userId: string, appId: string, requestId?: string): void {
    const context: MonitorContext = { userId, appId };
    if (requestId) {
      MonitorContextHolder.setContext(requestId, context);
    }
  }

  /**
   * 开始监控AI模型请求
   */
  startAiModelMonitoring(
    requestId: string,
    modelName: string,
    userId?: string,
    appId?: string,
  ): MonitorRequestContext {
    const context: MonitorRequestContext = {
      modelName,
      requestId,
      startTime: Date.now(),
      userId,
      appId,
    };

    this.contexts.set(requestId, context);

    // 调用监听器的onRequest方法
    this.aiModelMonitorListener.onRequest(requestId, modelName, userId, appId);

    this.logger.debug(`Started monitoring for request: ${requestId}`);
    return context;
  }

  /**
   * 结束AI模型监控（成功）
   */
  endAiModelMonitoring(
    requestId: string,
    success: boolean,
    inputTokens?: number,
    outputTokens?: number,
    totalTokens?: number,
    error?: string,
  ): void {
    const context = this.contexts.get(requestId);
    if (!context) {
      this.logger.warn(`No context found for request: ${requestId}`);
      return;
    }

    context.endTime = Date.now();
    context.success = success;
    context.inputTokens = inputTokens;
    context.outputTokens = outputTokens;
    context.tokenCount = totalTokens;
    context.error = error;

    // 计算成本
    if (totalTokens) {
      context.cost = this.calculateCost(context.modelName, totalTokens);
    }

    // 调用相应的监听器方法
    if (success) {
      this.aiModelMonitorListener.onResponse(
        requestId,
        context.modelName,
        inputTokens,
        outputTokens,
        totalTokens,
      );
    } else {
      this.aiModelMonitorListener.onError(requestId, context.modelName, error || 'Unknown error');
    }

    // 记录详细日志
    this.recordDetailedMetrics(context);

    // 清理上下文
    this.contexts.delete(requestId);
  }

  /**
   * 开始监控（兼容旧接口）
   */
  startMonitoring(requestId: string, modelName: string): MonitorRequestContext {
    return this.startAiModelMonitoring(requestId, modelName);
  }

  /**
   * 结束监控（兼容旧接口）
   */
  endMonitoring(requestId: string, success: boolean, tokenCount?: number, error?: string): void {
    this.endAiModelMonitoring(requestId, success, undefined, undefined, tokenCount, error);
  }

  /**
   * 获取Prometheus指标
   */
  async getPrometheusMetrics(): Promise<string> {
    return this.aiModelMetricsCollector.getMetrics();
  }

  /**
   * 计算成本
   */
  private calculateCost(modelName: string, tokenCount: number): number {
    const costPerToken = this.getCostPerToken(modelName);
    return tokenCount * costPerToken;
  }

  /**
   * 获取每个token的成本
   */
  private getCostPerToken(modelName: string): number {
    const costs: Record<string, number> = {
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
      'gpt-3.5-turbo': 0.000002,
      'claude-3': 0.000015,
      'claude-3-haiku': 0.00000025,
      'claude-3-sonnet': 0.000003,
      'claude-3-opus': 0.000015,
      'default': 0.00001,
    };

    return costs[modelName] || costs['default'];
  }

  /**
   * 记录详细指标
   */
  private recordDetailedMetrics(context: MonitorRequestContext): void {
    const duration = context.endTime! - context.startTime;

    this.logger.log(`AI Model Metrics:`, {
      model: context.modelName,
      requestId: context.requestId,
      duration: `${duration}ms`,
      inputTokens: context.inputTokens,
      outputTokens: context.outputTokens,
      totalTokens: context.tokenCount,
      cost: context.cost ? `$${context.cost.toFixed(6)}` : 'N/A',
      success: context.success,
      error: context.error,
      userId: context.userId,
      appId: context.appId,
    });
  }

  /**
   * 获取监控统计
   */
  getStats(): any {
    const contexts = Array.from(this.contexts.values());
    const totalRequests = contexts.length;
    const successfulRequests = contexts.filter(c => c.success).length;
    const totalTokens = contexts.reduce((sum, c) => sum + (c.tokenCount || 0), 0);
    const totalCost = contexts.reduce((sum, c) => sum + (c.cost || 0), 0);

    return {
      totalRequests,
      successfulRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(2) + '%' : '0%',
      totalTokens,
      totalCost: `$${totalCost.toFixed(6)}`,
      averageTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0,
      activeRequests: totalRequests,
    };
  }

  /**
   * 清理所有监控数据
   */
  clearAllMonitoringData(): void {
    this.contexts.clear();
    this.aiModelMonitorListener.clearAllContexts();
    this.aiModelMetricsCollector.clearCache();
  }
}