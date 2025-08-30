import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PerformanceService } from './performance.service';
import { MetricsCollectorService } from './services/metrics-collector.service';
import { AlertService } from './services/alert.service';

/**
 * 监控模块
 * 对齐Java版本的监控体系
 */
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService, 
    PerformanceService,
    MetricsCollectorService,
    AlertService,
  ],
  exports: [
    MonitoringService, 
    PerformanceService,
    MetricsCollectorService,
    AlertService,
  ],
})
export class MonitoringModule {}