import { Controller, Get, Header } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * 指标控制器 - 暴露Prometheus指标
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly monitorService: MonitorService) {}

  /**
   * 获取Prometheus格式的指标
   */
  @Get()
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.monitorService.getPrometheusMetrics();
  }

  /**
   * 获取监控统计信息
   */
  @Get('stats')
  @Public()
  getStats() {
    return this.monitorService.getStats();
  }
}