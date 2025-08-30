import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ConfigItem {
  key: string;
  value: any;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'object';
  updatedAt?: Date;
}

/**
 * 配置中心服务
 * 对齐Java版本的动态配置管理
 */
@Injectable()
export class ConfigCenterService implements OnModuleInit {
  private readonly logger = new Logger(ConfigCenterService.name);
  private configCache = new Map<string, any>();
  private configWatchers = new Map<string, ((value: any) => void)[]>();

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('配置中心服务初始化...');
    await this.loadDefaultConfigs();
    this.logger.log('配置中心服务初始化完成');
  }

  /**
   * 获取配置值
   */
  async getConfig<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      // 先从缓存获取
      if (this.configCache.has(key)) {
        return this.configCache.get(key);
      }

      // 从环境变量获取
      const envValue = this.configService.get(key);
      if (envValue !== undefined) {
        this.configCache.set(key, envValue);
        return envValue;
      }

      // 返回默认值
      if (defaultValue !== undefined) {
        this.configCache.set(key, defaultValue);
        return defaultValue;
      }

      throw new Error(`配置项 ${key} 不存在且无默认值`);
    } catch (error) {
      this.logger.error(`获取配置失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 设置配置值
   */
  async setConfig(key: string, value: any): Promise<void> {
    try {
      this.configCache.set(key, value);
      
      // 通知监听器
      const watchers = this.configWatchers.get(key) || [];
      watchers.forEach(watcher => {
        try {
          watcher(value);
        } catch (error) {
          this.logger.error(`配置监听器执行失败: ${key}`, error);
        }
      });

      this.logger.log(`配置更新成功: ${key} = ${JSON.stringify(value)}`);
    } catch (error) {
      this.logger.error(`设置配置失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 监听配置变化
   */
  watchConfig(key: string, callback: (value: any) => void): void {
    if (!this.configWatchers.has(key)) {
      this.configWatchers.set(key, []);
    }
    this.configWatchers.get(key)!.push(callback);
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<Map<string, any>> {
    return new Map(this.configCache);
  }

  /**
   * 批量设置配置
   */
  async setBatchConfigs(configs: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(configs)) {
      await this.setConfig(key, value);
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(key: string): Promise<boolean> {
    try {
      const deleted = this.configCache.delete(key);
      if (deleted) {
        this.logger.log(`配置删除成功: ${key}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`删除配置失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 重新加载配置
   */
  async reloadConfigs(): Promise<void> {
    try {
      this.configCache.clear();
      await this.loadDefaultConfigs();
      this.logger.log('配置重新加载完成');
    } catch (error) {
      this.logger.error('配置重新加载失败', error);
      throw error;
    }
  }

  /**
   * 获取配置统计信息
   */
  getConfigStats(): {
    totalConfigs: number;
    watchedConfigs: number;
    lastUpdated: Date;
  } {
    return {
      totalConfigs: this.configCache.size,
      watchedConfigs: this.configWatchers.size,
      lastUpdated: new Date(),
    };
  }

  /**
   * 加载默认配置
   */
  private async loadDefaultConfigs(): Promise<void> {
    const defaultConfigs = this.getDefaultConfigs();
    
    for (const [key, value] of defaultConfigs.entries()) {
      // 只有当配置不存在时才设置默认值
      if (!this.configCache.has(key)) {
        this.configCache.set(key, value);
      }
    }
  }

  /**
   * 获取默认配置映射
   */
  private getDefaultConfigs(): Map<string, any> {
    return new Map<string, any>([
      ['ai.openai.model', 'gpt-3.5-turbo'],
      ['ai.openai.temperature', 0.7],
      ['ai.openai.max_tokens', 2000],
      ['gateway.timeout', 30000],
      ['gateway.retry_attempts', 3],
      ['queue.code_generation.concurrency', 5],
      ['queue.deployment.concurrency', 2],
      ['cache.ttl.default', 300],
      ['cache.ttl.user_session', 1800],
      ['health_check.interval', 30000],
      ['health_check.timeout', 5000],
    ]);
  }

  /**
   * 验证配置值
   */
  private validateConfigValue(key: string, value: any): boolean {
    try {
      // 基本类型验证
      if (value === null || value === undefined) {
        return false;
      }

      // 特定配置的验证规则
      if (key.includes('timeout') || key.includes('interval')) {
        return typeof value === 'number' && value > 0;
      }

      if (key.includes('temperature')) {
        return typeof value === 'number' && value >= 0 && value <= 2;
      }

      if (key.includes('concurrency')) {
        return typeof value === 'number' && value > 0 && value <= 100;
      }

      return true;
    } catch (error) {
      this.logger.error(`配置验证失败: ${key}`, error);
      return false;
    }
  }
}