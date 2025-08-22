import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Injectable()
export class RedisConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const redisStoreInstance = await redisStore({
      socket: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
      },
      password: this.configService.get('REDIS_PASSWORD', ''),
      database: this.configService.get('REDIS_DB', 0),
      ttl: 60 * 60, // 默认1小时过期
      max: 1000, // 最大缓存条目数
    });

    return {
      store: redisStoreInstance,
      ttl: 60 * 60, // 1小时
      max: 1000,
    };
  }
}
