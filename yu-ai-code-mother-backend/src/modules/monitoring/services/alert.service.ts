import { Injectable, Logger } from '@nestjs/common';
import { AlertRule, AlertEvent, SystemMetrics } from '../interfaces/metrics.interface';

/**
 * 告警服务
 * 对齐Java版本的告警机制
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private alertHistory: AlertEvent[] = [];

  constructor() {
    // 初始化默认告警规则
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultRules() {
    const defaultRules: AlertRule[] = [
      {
        id: 'cpu-high',
        name: 'CPU使用率过高',
        metric: 'cpuUsage',
        operator: 'gt',
        threshold: 80,
        duration: 300, // 5分钟
        enabled: true,
        severity: 'high',
      },
      {
        id: 'memory-high',
        name: '内存使用率过高',
        metric: 'memoryUsage',
        operator: 'gt',
        threshold: 85,
        duration: 300,
        enabled: true,
        severity: 'high',
      },
      {
        id: 'disk-high',
        name: '磁盘使用率过高',
        metric: 'diskUsage',
        operator: 'gt',
        threshold: 90,
        duration: 600, // 10分钟
        enabled: true,
        severity: 'critical',
      },
      {
        id: 'response-time-high',
        name: '响应时间过长',
        metric: 'responseTime',
        operator: 'gt',
        threshold: 2000, // 2秒
        duration: 180, // 3分钟
        enabled: true,
        severity: 'medium',
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });

    this.logger.log(`初始化了 ${defaultRules.length} 个默认告警规则`);
  }

  /**
   * 检查指标并触发告警
   */
  async checkMetrics(metrics: SystemMetrics): Promise<AlertEvent[]> {
    const triggeredAlerts: AlertEvent[] = [];

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const metricValue = this.getMetricValue(metrics, rule.metric);
      if (metricValue === null) continue;

      const shouldAlert = this.evaluateRule(rule, metricValue);

      if (shouldAlert) {
        const alert = await this.triggerAlert(rule, metricValue, metrics.timestamp);
        if (alert) {
          triggeredAlerts.push(alert);
        }
      } else {
        // 检查是否需要解决现有告警
        await this.resolveAlert(rule.id);
      }
    }

    return triggeredAlerts;
  }

  /**
   * 获取指标值
   */
  private getMetricValue(metrics: SystemMetrics, metricName: string): number | null {
    switch (metricName) {
      case 'cpuUsage':
        return metrics.cpuUsage;
      case 'memoryUsage':
        return metrics.memoryUsage;
      case 'diskUsage':
        return metrics.diskUsage || 0;
      case 'responseTime':
        return metrics.responseTime;
      case 'errorCount':
        return metrics.errorCount;
      default:
        return null;
    }
  }

  /**
   * 评估告警规则
   */
  private evaluateRule(rule: AlertRule, value: number): boolean {
    switch (rule.operator) {
      case 'gt':
        return value > rule.threshold;
      case 'gte':
        return value >= rule.threshold;
      case 'lt':
        return value < rule.threshold;
      case 'lte':
        return value <= rule.threshold;
      case 'eq':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule, 
    currentValue: number, 
    timestamp: Date
  ): Promise<AlertEvent | null> {
    const existingAlert = this.activeAlerts.get(rule.id);
    
    // 如果已经有活跃的告警，不重复触发
    if (existingAlert && !existingAlert.resolved) {
      return null;
    }

    const alert: AlertEvent = {
      id: `${rule.id}-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, currentValue),
      timestamp,
      resolved: false,
    };

    // 存储活跃告警
    this.activeAlerts.set(rule.id, alert);
    
    // 添加到历史记录
    this.alertHistory.push(alert);

    // 发送告警通知
    await this.sendAlertNotification(alert);

    this.logger.warn(`触发告警: ${alert.message}`);

    return alert;
  }

  /**
   * 解决告警
   */
  private async resolveAlert(ruleId: string): Promise<void> {
    const activeAlert = this.activeAlerts.get(ruleId);
    
    if (activeAlert && !activeAlert.resolved) {
      activeAlert.resolved = true;
      activeAlert.resolvedAt = new Date();
      
      // 从活跃告警中移除
      this.activeAlerts.delete(ruleId);
      
      this.logger.log(`告警已解决: ${activeAlert.ruleName}`);
      
      // 发送解决通知
      await this.sendResolvedNotification(activeAlert);
    }
  }

  /**
   * 生成告警消息
   */
  private generateAlertMessage(rule: AlertRule, currentValue: number): string {
    return `${rule.name}: 当前值 ${currentValue.toFixed(2)} ${rule.operator} 阈值 ${rule.threshold}`;
  }

  /**
   * 发送告警通知
   */
  private async sendAlertNotification(alert: AlertEvent): Promise<void> {
    // 这里可以集成邮件、短信、钉钉等通知方式
    this.logger.warn(`[告警通知] ${alert.message}`);
    
    // TODO: 实现具体的通知逻辑
    // - 邮件通知
    // - 短信通知  
    // - 钉钉/企业微信通知
    // - Webhook通知
  }

  /**
   * 发送解决通知
   */
  private async sendResolvedNotification(alert: AlertEvent): Promise<void> {
    this.logger.log(`[告警解决] ${alert.ruleName} 已恢复正常`);
    
    // TODO: 实现解决通知逻辑
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit: number = 100): AlertEvent[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.logger.log(`添加告警规则: ${rule.name}`);
  }

  /**
   * 更新告警规则
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    this.alertRules.set(ruleId, rule);
    this.logger.log(`更新告警规则: ${rule.name}`);
    return true;
  }

  /**
   * 删除告警规则
   */
  deleteAlertRule(ruleId: string): boolean {
    const deleted = this.alertRules.delete(ruleId);
    if (deleted) {
      // 同时解决相关的活跃告警
      this.resolveAlert(ruleId);
      this.logger.log(`删除告警规则: ${ruleId}`);
    }
    return deleted;
  }

  /**
   * 获取所有告警规则
   */
  getAllAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }
}