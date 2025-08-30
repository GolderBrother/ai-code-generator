import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * 多级缓存服务
 * 对齐Java版本的Redis + Caffeine多级缓存架构
 */
@Injectable()
export class MultiLevelCacheService {
  private readonly logger = new Logger(MultiLevelCacheService.name);
  private readonly localCache = new Map<string, { value: any; expiry: number }>();
  private readonly localCacheMaxSize = 1000;
  private readonly defaultLocalTtl = 300; // 5分钟本地缓存

  constructor(private readonly cacheService: CacheService) {
    // 定期清理过期的本地缓存
    setInterval(() => this.cleanExpiredLocalCache(), 60000); // 每分钟清理一次
  }

  /**
   * 多级缓存获取
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // L1: 本地缓存
      const localValue = this.getFromLocalCache<T>(key);
      if (localValue !== null) {
        this.logger.debug(`L1缓存命中: ${key}`);
        return localValue;
      }

      // L2: Redis缓存
      const redisValue = await this.cacheService.get<T>(key);
      if (redisValue !== null) {
        this.logger.debug(`L2缓存命中: ${key}`);
        // 更新本地缓存
        this.setToLocalCache(key, redisValue, this.defaultLocalTtl);
        return redisValue;
      }

      this.logger.debug(`缓存未命中: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`多级缓存获取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 多级缓存设置
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      // 设置Redis缓存
      await this.cacheService.set(key, value, ttl);
      
      // 设置本地缓存
      const localTtl = Math.min(ttl || this.defaultLocalTtl, this.defaultLocalTtl);
      this.setToLocalCache(key, value, localTtl);
      
      this.logger.debug(`多级缓存设置成功: ${key}`);
    } catch (error) {
      this.logger.error(`多级缓存设置失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 从本地缓存获取
   */
  private getFromLocalCache<T>(key: string): T | null {
    const item = this.localCache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.localCache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 设置本地缓存
   */
  private setToLocalCache(key: string, value: any, ttlSeconds: number): void {
    // 如果缓存已满，删除最旧的条目
    if (this.localCache.size >= this.localCacheMaxSize) {
      const firstKey = this.localCache.keys().next().value;
      if (firstKey) {
        this.localCache.delete(firstKey);
      }
    }

    const expiry = Date.now() + (ttlSeconds * 1000);
    this.localCache.set(key, { value, expiry });
  }

  /**
   * 清理过期的本地缓存
   */
  private cleanExpiredLocalCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.localCache.entries()) {
      if (now > item.expiry) {
        this.localCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`清理过期本地缓存: ${cleanedCount} 个条目`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): any {
    return {
      localCacheSize: this.localCache.size,
      localCacheMaxSize: this.localCacheMaxSize,
      timestamp: new Date(),
    };
  }
}