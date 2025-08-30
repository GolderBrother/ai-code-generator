import { Injectable, Logger } from '@nestjs/common';

export interface PerformanceData {
  timestamp: string;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errors: {
    rate: number;
    total: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
}

/**
 * 性能监控服务
 * 对齐Java版本的性能分析功能
 */
@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly responseTimes: number[] = [];
  private readonly requestTimestamps: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;

  /**
   * 记录响应时间
   */
  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    this.requestTimestamps.push(Date.now());
    this.totalRequests++;

    // 保持最近1000个记录
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
      this.requestTimestamps.shift();
    }
  }

  /**
   * 记录错误
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * 获取性能数据
   */
  async getPerformanceData(): Promise<PerformanceData> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;

    // 计算最近一分钟和一秒钟的请求数
    const recentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    const veryRecentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneSecondAgo);

    // 计算响应时间百分位数
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const responseTime = {
      p50: this.getPercentile(sortedResponseTimes, 50),
      p95: this.getPercentile(sortedResponseTimes, 95),
      p99: this.getPercentile(sortedResponseTimes, 99),
      average: this.responseTimes.length > 0 
        ? Math.round(this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length)
        : 0,
    };

    // 计算吞吐量
    const throughput = {
      requestsPerSecond: veryRecentRequests.length,
      requestsPerMinute: recentRequests.length,
    };

    // 计算错误率
    const errors = {
      rate: this.totalRequests > 0 ? Math.round((this.errorCount / this.totalRequests) * 100) : 0,
      total: this.errorCount,
    };

    // 获取资源使用情况
    const resources = await this.getResourceUsage();

    return {
      timestamp: new Date().toISOString(),
      responseTime,
      throughput,
      errors,
      resources,
    };
  }

  /**
   * 获取资源使用情况
   */
  private async getResourceUsage(): Promise<{
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  }> {
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    return {
      memoryUsage: memoryPercentage,
      cpuUsage: await this.getCpuUsage(),
      diskUsage: 0, // 简化实现，实际项目中可以使用fs.statSync获取磁盘使用情况
    };
  }

  /**
   * 获取CPU使用率
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const percentage = Math.round((totalUsage / 1000000) * 100);
        resolve(Math.min(percentage, 100));
      }, 100);
    });
  }

  /**
   * 计算百分位数
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)] || 0;
  }

  /**
   * 重置性能数据
   */
  resetPerformanceData(): void {
    this.responseTimes.length = 0;
    this.requestTimestamps.length = 0;
    this.errorCount = 0;
    this.totalRequests = 0;
    this.logger.log('性能数据已重置');
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(): Promise<{
    summary: string;
    recommendations: string[];
    data: PerformanceData;
  }> {
    const data = await this.getPerformanceData();
    
    const recommendations: string[] = [];
    
    // 基于性能数据生成建议
    if (data.responseTime.average > 1000) {
      recommendations.push('平均响应时间较高，建议优化数据库查询或增加缓存');
    }
    
    if (data.errors.rate > 5) {
      recommendations.push('错误率较高，建议检查应用程序日志并修复相关问题');
    }
    
    if (data.resources.memoryUsage > 80) {
      recommendations.push('内存使用率较高，建议优化内存使用或增加服务器内存');
    }
    
    if (data.resources.cpuUsage > 80) {
      recommendations.push('CPU使用率较高，建议优化算法或增加服务器CPU');
    }

    const summary = `
系统性能概览:
- 平均响应时间: ${data.responseTime.average}ms
- 每分钟请求数: ${data.throughput.requestsPerMinute}
- 错误率: ${data.errors.rate}%
- 内存使用率: ${data.resources.memoryUsage}%
- CPU使用率: ${data.resources.cpuUsage}%
    `.trim();

    return {
      summary,
      recommendations,
      data,
    };
  }
}