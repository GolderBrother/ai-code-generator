import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { AiModelMetricsCollector } from './ai-model-metrics.collector';

@Module({
  providers: [MonitorService, AiModelMetricsCollector],
  exports: [MonitorService, AiModelMetricsCollector],
})
export class MonitorModule {}