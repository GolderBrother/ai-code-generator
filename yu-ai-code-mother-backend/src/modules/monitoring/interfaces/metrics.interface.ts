/**
 * 系统指标接口
 */
export interface SystemMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number;
  networkIO?: NetworkIO;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  responseTime: number;
}

/**
 * 网络IO指标
 */
export interface NetworkIO {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
}

/**
 * 应用指标
 */
export interface ApplicationMetrics {
  timestamp: Date;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  cacheHitRate?: number;
  databaseConnections?: number;
}

/**
 * 告警规则
 */
export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // 持续时间（秒）
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 告警事件
 */
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}