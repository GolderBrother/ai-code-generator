import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { PerformanceService } from './performance.service';

/**
 * 监控控制器
 * 对齐Java版本的监控API
 */
@ApiTags('监控')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly performanceService: PerformanceService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: '获取系统健康状态' })
  @ApiResponse({ status: 200, description: '健康检查成功' })
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: '获取系统指标' })
  @ApiResponse({ status: 200, description: '指标获取成功' })
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('metrics/prometheus')
  @ApiOperation({ summary: '获取Prometheus格式指标' })
  @ApiResponse({ status: 200, description: 'Prometheus指标获取成功' })
  async getPrometheusMetrics() {
    const metrics = await this.monitoringService.getPrometheusMetrics();
    return { metrics };
  }

  @Get('performance')
  @ApiOperation({ summary: '获取性能数据' })
  @ApiResponse({ status: 200, description: '性能数据获取成功' })
  async getPerformanceData() {
    return this.performanceService.getPerformanceData();
  }

  @Get('performance/report')
  @ApiOperation({ summary: '获取性能报告' })
  @ApiResponse({ status: 200, description: '性能报告获取成功' })
  async getPerformanceReport() {
    return this.performanceService.getPerformanceReport();
  }
}