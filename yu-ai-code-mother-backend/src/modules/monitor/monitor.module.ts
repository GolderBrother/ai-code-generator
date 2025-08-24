import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { AiModelMetricsCollector } from './ai-model-metrics.collector';
import { AiModelMonitorListener } from './ai-model-monitor.listener';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [
    MonitorService,
    AiModelMetricsCollector,
    AiModelMonitorListener,
  ],
  exports: [
    MonitorService,
    AiModelMetricsCollector,
    AiModelMonitorListener,
  ],
})
export class MonitorModule {}
