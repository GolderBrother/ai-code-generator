import { Injectable, Logger } from '@nestjs/common';
import { register, Counter, Histogram, Registry } from 'prom-client';

/**
 * AI模型指标收集器（对应Java的AiModelMetricsCollector）
 */
@Injectable()
export class AiModelMetricsCollector {
  private readonly logger = new Logger(AiModelMetricsCollector.name);
  
  // 缓存已创建的指标，避免重复创建
  private readonly requestCountersCache = new Map<string, Counter<string>>();
  private readonly errorCountersCache = new Map<string, Counter<string>>();
  private readonly tokenCountersCache = new Map<string, Counter<string>>();
  private readonly responseTimersCache = new Map<string, Histogram<string>>();

  constructor() {
    // 清理默认注册表，避免重复注册
    register.clear();
  }

  /**
   * 记录请求次数
   */
  recordRequest(userId: string, appId: string, modelName: string, status: string): void {
    const key = `${userId}_${appId}_${modelName}_${status}`;
    
    let counter = this.requestCountersCache.get(key);
    if (!counter) {
      counter = new Counter({
        name: 'ai_model_requests_total',
        help: 'AI模型总请求次数',
        labelNames: ['user_id', 'app_id', 'model_name', 'status'],
        registers: [register],
      });
      this.requestCountersCache.set(key, counter);
    }

    counter.inc({
      user_id: userId,
      app_id: appId,
      model_name: modelName,
      status: status,
    });

    this.logger.debug(`Recorded request: ${key}`);
  }

  /**
   * 记录错误
   */
  recordError(userId: string, appId: string, modelName: string, errorMessage: string): void {
    const key = `${userId}_${appId}_${modelName}_${errorMessage}`;
    
    let counter = this.errorCountersCache.get(key);
    if (!counter) {
      counter = new Counter({
        name: 'ai_model_errors_total',
        help: 'AI模型错误次数',
        labelNames: ['user_id', 'app_id', 'model_name', 'error_message'],
        registers: [register],
      });
      this.errorCountersCache.set(key, counter);
    }

    counter.inc({
      user_id: userId,
      app_id: appId,
      model_name: modelName,
      error_message: errorMessage,
    });

    this.logger.error(`Recorded error: ${key}`);
  }

  /**
   * 记录Token消耗
   */
  recordTokenUsage(
    userId: string,
    appId: string,
    modelName: string,
    tokenType: string,
    tokenCount: number,
  ): void {
    const key = `${userId}_${appId}_${modelName}_${tokenType}`;
    
    let counter = this.tokenCountersCache.get(key);
    if (!counter) {
      counter = new Counter({
        name: 'ai_model_tokens_total',
        help: 'AI模型Token消耗总数',
        labelNames: ['user_id', 'app_id', 'model_name', 'token_type'],
        registers: [register],
      });
      this.tokenCountersCache.set(key, counter);
    }

    counter.inc({
      user_id: userId,
      app_id: appId,
      model_name: modelName,
      token_type: tokenType,
    }, tokenCount);

    this.logger.debug(`Recorded token usage: ${key}, count: ${tokenCount}`);
  }

  /**
   * 记录响应时间
   */
  recordResponseTime(
    userId: string,
    appId: string,
    modelName: string,
    durationMs: number,
  ): void {
    const key = `${userId}_${appId}_${modelName}`;
    
    let histogram = this.responseTimersCache.get(key);
    if (!histogram) {
      histogram = new Histogram({
        name: 'ai_model_response_duration_seconds',
        help: 'AI模型响应时间',
        labelNames: ['user_id', 'app_id', 'model_name'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60], // 响应时间分桶
        registers: [register],
      });
      this.responseTimersCache.set(key, histogram);
    }

    // 转换为秒
    const durationSeconds = durationMs / 1000;
    histogram.observe({
      user_id: userId,
      app_id: appId,
      model_name: modelName,
    }, durationSeconds);

    this.logger.debug(`Recorded response time: ${key}, duration: ${durationMs}ms`);
  }

  /**
   * 获取所有指标
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.requestCountersCache.clear();
    this.errorCountersCache.clear();
    this.tokenCountersCache.clear();
    this.responseTimersCache.clear();
    register.clear();
  }
}