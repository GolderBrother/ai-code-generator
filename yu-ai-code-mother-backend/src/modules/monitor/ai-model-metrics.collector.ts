import { Injectable } from '@nestjs/common';
import { MonitorService } from './monitor.service';

@Injectable()
export class AiModelMetricsCollector {
  constructor(private readonly monitorService: MonitorService) {}

  /**
   * 收集AI模型指标
   */
  collectMetrics(modelName: string, requestId: string) {
    return this.monitorService.startMonitoring(requestId, modelName);
  }

  /**
   * 完成指标收集
   */
  completeMetrics(requestId: string, success: boolean, tokenCount?: number, error?: string) {
    this.monitorService.endMonitoring(requestId, success, tokenCount, error);
  }

  /**
   * 获取指标统计
   */
  getMetricsStats() {
    return this.monitorService.getStats();
  }
}