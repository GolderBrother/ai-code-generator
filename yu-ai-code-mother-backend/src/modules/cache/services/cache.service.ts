import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * 缓存服务
 * 对齐Java版本的Redis缓存功能
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`缓存设置成功: ${key}`);
    } catch (error) {
      this.logger.error(`缓存设置失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      this.logger.debug(`缓存获取: ${key}, 命中: ${value !== null}`);
      return value || null;
    } catch (error) {
      this.logger.error(`缓存获取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`缓存删除成功: ${key}`);
    } catch (error) {
      this.logger.error(`缓存删除失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 清空所有缓存
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('所有缓存已清空');
    } catch (error) {
      this.logger.error('清空缓存失败', error);
      throw error;
    }
  }
}