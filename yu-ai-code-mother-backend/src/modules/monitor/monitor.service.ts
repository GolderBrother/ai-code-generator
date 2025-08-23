import { Injectable } from '@nestjs/common';

export interface MonitorContext {
  modelName: string;
  requestId: string;
  startTime: number;
  endTime?: number;
  tokenCount?: number;
  cost?: number;
  success?: boolean;
  error?: string;
}

@Injectable()
export class MonitorService {
  private contexts: Map<string, MonitorContext> = new Map();

  /**
   * 开始监控
   */
  startMonitoring(requestId: string, modelName: string): MonitorContext {
    const context: MonitorContext = {
      modelName,
      requestId,
      startTime: Date.now(),
    };
    
    this.contexts.set(requestId, context);
    return context;
  }

  /**
   * 结束监控
   */
  endMonitoring(requestId: string, success: boolean, tokenCount?: number, error?: string): void {
    const context = this.contexts.get(requestId);
    if (context) {
      context.endTime = Date.now();
      context.success = success;
      context.tokenCount = tokenCount;
      context.error = error;
      
      // 计算成本（示例）
      if (tokenCount) {
        context.cost = this.calculateCost(context.modelName, tokenCount);
      }
      
      // 记录指标
      this.recordMetrics(context);
    }
  }

  /**
   * 计算成本
   */
  private calculateCost(modelName: string, tokenCount: number): number {
    // 简化的成本计算逻辑
    const costPerToken = this.getCostPerToken(modelName);
    return tokenCount * costPerToken;
  }

  /**
   * 获取每个token的成本
   */
  private getCostPerToken(modelName: string): number {
    const costs = {
      'gpt-4': 0.00003,
      'gpt-3.5-turbo': 0.000002,
      'claude-3': 0.000015,
      'default': 0.00001,
    };
    
    return costs[modelName] || costs['default'];
  }

  /**
   * 记录指标
   */
  private recordMetrics(context: MonitorContext): void {
    const duration = context.endTime - context.startTime;
    
    console.log(`AI Model Metrics:`, {
      model: context.modelName,
      requestId: context.requestId,
      duration: `${duration}ms`,
      tokens: context.tokenCount,
      cost: context.cost ? `$${context.cost.toFixed(6)}` : 'N/A',
      success: context.success,
      error: context.error,
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
    };
  }
}