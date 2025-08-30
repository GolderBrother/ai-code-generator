import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SystemMetrics, ApplicationMetrics } from '../interfaces/metrics.interface';
import * as os from 'os';
import * as fs from 'fs';

/**
 * 指标收集服务
 * 对齐Java版本的监控指标收集
 */
@Injectable()
export class MetricsCollectorService {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private metrics: Map<string, SystemMetrics> = new Map();
  private appMetrics: Map<string, ApplicationMetrics> = new Map();

  /**
   * 收集系统指标
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const cpuUsage = await this.getCpuUsage();
      const memoryUsage = this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();
      
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpuUsage,
        memoryUsage,
        diskUsage,
        activeConnections: 0, // 需要实现
        requestCount: 0, // 需要实现
        errorCount: 0, // 需要实现
        responseTime: 0, // 需要实现
      };

      // 存储指标
      const key = new Date().toISOString().slice(0, 16); // 精确到分钟
      this.metrics.set(key, metrics);

      // 只保留最近24小时的数据
      this.cleanOldMetrics();

      return metrics;
    } catch (error) {
      this.logger.error('收集系统指标失败:', error);
      throw error;
    }
  }

  /**
   * 获取CPU使用率
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
        resolve(percentageCPU);
      }, 100);
    });
  }

  /**
   * CPU平均值计算
   */
  private cpuAverage() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    
    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }
    
    const total = user + nice + sys + idle + irq;
    return { idle, total };
  }

  /**
   * 获取内存使用率
   */
  private getMemoryUsage(): number {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    return (usedMemory / totalMemory) * 100;
  }

  /**
   * 获取磁盘使用率
   */
  private async getDiskUsage(): Promise<number> {
    try {
      const stats = await fs.promises.statfs('./');
      const total = stats.blocks * stats.bsize;
      const free = stats.bavail * stats.bsize;
      const used = total - free;
      return (used / total) * 100;
    } catch (error) {
      this.logger.warn('无法获取磁盘使用率:', error);
      return 0;
    }
  }

  /**
   * 定时收集指标
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async collectMetricsScheduled() {
    try {
      await this.collectSystemMetrics();
      this.logger.debug('定时收集系统指标完成');
    } catch (error) {
      this.logger.error('定时收集指标失败:', error);
    }
  }

  /**
   * 清理旧指标数据
   */
  private cleanOldMetrics() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.timestamp < oneDayAgo) {
        this.metrics.delete(key);
      }
    }
  }

  /**
   * 获取历史指标
   */
  getHistoricalMetrics(hours: number = 1): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.metrics.values())
      .filter(metrics => metrics.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * 获取最新指标
   */
  getLatestMetrics(): SystemMetrics | null {
    const values = Array.from(this.metrics.values());
    if (values.length === 0) return null;
    
    return values.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }
}