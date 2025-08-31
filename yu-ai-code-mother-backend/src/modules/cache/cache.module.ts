import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './services/cache.service';
import { MultiLevelCacheService } from './services/multi-level-cache.service';

/**
 * 缓存模块
 * 对齐Java版本的Redis + Caffeine多级缓存
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get('REDIS_HOST', '127.0.0.1'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('CACHE_TTL', 3600), // 默认1小时
        max: configService.get('CACHE_MAX_ITEMS', 1000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService, MultiLevelCacheService],
  exports: [CacheService, MultiLevelCacheService],
})
export class CacheModule {}