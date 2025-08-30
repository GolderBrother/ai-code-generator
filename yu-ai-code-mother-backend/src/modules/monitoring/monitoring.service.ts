import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  services: Record<string, 'up' | 'down'>;
}

export interface MetricsData {
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  ai: {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageGenerationTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

/**
 * 监控服务
 * 对齐Java版本的Prometheus + Grafana监控体系
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly metrics: MetricsData = {
    requests: {
      total: 0,
      success: 0,
      error: 0,
      averageResponseTime: 0,
    },
    ai: {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
    },
    cache: {
      hits: 0,
      misses: 0,
      hitRate: 0,
    },
  };

  private readonly startTime = Date.now();

  constructor(private readonly configService: ConfigService) {
    this.startMetricsCollection();
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = Date.now() - this.startTime;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
        cpu: {
          usage: await this.getCpuUsage(),
        },
        services: {
          'ai-service': 'up',
          'database': 'up',
          'cache': 'up',
        },
      };
    } catch (error) {
      this.logger.error('获取系统健康状态失败', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: 0,
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
        services: {},
      };
    }
  }

  /**
   * 获取指标数据
   */
  getMetrics(): MetricsData {
    // 计算缓存命中率
    const totalCacheRequests = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = totalCacheRequests > 0 
      ? Math.round((this.metrics.cache.hits / totalCacheRequests) * 100) 
      : 0;

    return { ...this.metrics };
  }

  /**
   * 记录请求指标
   */
  recordRequest(success: boolean, responseTime: number): void {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }

    // 更新平均响应时间
    this.metrics.requests.averageResponseTime = Math.round(
      (this.metrics.requests.averageResponseTime * (this.metrics.requests.total - 1) + responseTime) / 
      this.metrics.requests.total
    );
  }

  /**
   * 记录AI生成指标
   */
  recordAiGeneration(success: boolean, generationTime: number): void {
    this.metrics.ai.totalGenerations++;
    
    if (success) {
      this.metrics.ai.successfulGenerations++;
    } else {
      this.metrics.ai.failedGenerations++;
    }

    // 更新平均生成时间
    this.metrics.ai.averageGenerationTime = Math.round(
      (this.metrics.ai.averageGenerationTime * (this.metrics.ai.totalGenerations - 1) + generationTime) / 
      this.metrics.ai.totalGenerations
    );
  }

  /**
   * 记录缓存指标
   */
  recordCacheHit(): void {
    this.metrics.cache.hits++;
  }

  recordCacheMiss(): void {
    this.metrics.cache.misses++;
  }

  /**
   * 获取Prometheus格式的指标
   */
  async getPrometheusMetrics(): Promise<string> {
    const metrics = this.getMetrics();
    const health = await this.getSystemHealth();

    return `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{status="success"} ${metrics.requests.success}
http_requests_total{status="error"} ${metrics.requests.error}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${metrics.requests.averageResponseTime}

# HELP ai_generations_total Total number of AI code generations
# TYPE ai_generations_total counter
ai_generations_total{status="success"} ${metrics.ai.successfulGenerations}
ai_generations_total{status="failed"} ${metrics.ai.failedGenerations}

# HELP ai_generation_duration_ms Average AI generation duration in milliseconds
# TYPE ai_generation_duration_ms gauge
ai_generation_duration_ms ${metrics.ai.averageGenerationTime}

# HELP cache_requests_total Total number of cache requests
# TYPE cache_requests_total counter
cache_requests_total{result="hit"} ${metrics.cache.hits}
cache_requests_total{result="miss"} ${metrics.cache.misses}

# HELP cache_hit_rate Cache hit rate percentage
# TYPE cache_hit_rate gauge
cache_hit_rate ${metrics.cache.hitRate}

# HELP system_memory_usage_bytes System memory usage in bytes
# TYPE system_memory_usage_bytes gauge
system_memory_usage_bytes ${health.memory.used * 1024 * 1024}

# HELP system_cpu_usage_percent System CPU usage percentage
# TYPE system_cpu_usage_percent gauge
system_cpu_usage_percent ${health.cpu.usage}

# HELP system_uptime_seconds System uptime in seconds
# TYPE system_uptime_seconds counter
system_uptime_seconds ${health.uptime}
    `.trim();
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics.requests = {
      total: 0,
      success: 0,
      error: 0,
      averageResponseTime: 0,
    };
    this.metrics.ai = {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
    };
    this.metrics.cache = {
      hits: 0,
      misses: 0,
      hitRate: 0,
    };

    this.logger.log('监控指标已重置');
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
        const percentage = Math.round((totalUsage / 1000000) * 100); // 转换为百分比
        resolve(Math.min(percentage, 100));
      }, 100);
    });
  }

  /**
   * 启动指标收集
   */
  private startMetricsCollection(): void {
    // 每30秒记录一次系统指标
    setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        this.logger.debug(`系统状态: ${health.status}, 内存使用: ${health.memory.percentage}%, CPU使用: ${health.cpu.usage}%`);
      } catch (error) {
        this.logger.error('系统指标收集失败', error);
      }
    }, 30000);
  }
}