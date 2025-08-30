import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 多级缓存服务
 * 对齐Java版本的Redis + Caffeine缓存架构
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly localCache = new Map<string, { value: any; expireAt: number }>();
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtl = this.configService.get('cache.ttl.default', 300) * 1000; // 转换为毫秒
    this.startCleanupTimer();
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const expireTime = ttl ? ttl * 1000 : this.defaultTtl;
      const expireAt = Date.now() + expireTime;
      
      this.localCache.set(key, { value, expireAt });
      this.logger.debug(`缓存设置成功: ${key}, TTL: ${expireTime}ms`);
    } catch (error) {
      this.logger.error(`缓存设置失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = this.localCache.get(key);
      
      if (!cached) {
        return null;
      }

      // 检查是否过期
      if (Date.now() > cached.expireAt) {
        this.localCache.delete(key);
        return null;
      }

      return cached.value;
    } catch (error) {
      this.logger.error(`缓存获取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<boolean> {
    try {
      const deleted = this.localCache.delete(key);
      if (deleted) {
        this.logger.debug(`缓存删除成功: ${key}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`缓存删除失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    const cached = this.localCache.get(key);
    if (!cached) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > cached.expireAt) {
      this.localCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 设置缓存过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const cached = this.localCache.get(key);
      if (!cached) {
        return false;
      }

      cached.expireAt = Date.now() + (ttl * 1000);
      return true;
    } catch (error) {
      this.logger.error(`设置缓存过期时间失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 获取缓存剩余过期时间（秒）
   */
  async ttl(key: string): Promise<number> {
    const cached = this.localCache.get(key);
    if (!cached) {
      return -2; // 键不存在
    }

    const remaining = cached.expireAt - Date.now();
    if (remaining <= 0) {
      this.localCache.delete(key);
      return -2;
    }

    return Math.ceil(remaining / 1000);
  }

  /**
   * 清空所有缓存
   */
  async flushAll(): Promise<void> {
    try {
      this.localCache.clear();
      this.logger.log('所有缓存已清空');
    } catch (error) {
      this.logger.error('清空缓存失败', error);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    totalKeys: number;
    expiredKeys: number;
    memoryUsage: string;
  }> {
    let expiredKeys = 0;
    const now = Date.now();

    for (const [key, cached] of this.localCache.entries()) {
      if (now > cached.expireAt) {
        expiredKeys++;
      }
    }

    return {
      totalKeys: this.localCache.size,
      expiredKeys,
      memoryUsage: `${Math.round(JSON.stringify([...this.localCache.entries()]).length / 1024)}KB`,
    };
  }

  /**
   * 批量设置缓存
   */
  async mset(keyValues: Record<string, any>, ttl?: number): Promise<void> {
    for (const [key, value] of Object.entries(keyValues)) {
      await this.set(key, value, ttl);
    }
  }

  /**
   * 批量获取缓存
   */
  async mget<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    
    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }

    return result;
  }

  /**
   * 获取匹配模式的所有键
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const matchingKeys: string[] = [];

    for (const key of this.localCache.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    }

    return matchingKeys;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredKeys();
    }, 60000); // 每分钟清理一次过期键
  }

  /**
   * 清理过期的键
   */
  private cleanupExpiredKeys(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.localCache.entries()) {
      if (now > cached.expireAt) {
        this.localCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`清理过期缓存键: ${cleanedCount} 个`);
    }
  }
}