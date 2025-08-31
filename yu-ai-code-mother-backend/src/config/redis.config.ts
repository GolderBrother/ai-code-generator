import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheStore } from '@nestjs/cache-manager';

@Injectable()
export class RedisConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const password = this.configService.get('REDIS_PASSWORD');
    const config: any = {
      socket: {
        host: this.configService.get('REDIS_HOST', '127.0.0.1'),
        port: this.configService.get('REDIS_PORT', 6379),
      },
      database: this.configService.get('REDIS_DB', 0),
      ttl: 60 * 60, // 默认1小时过期
    };

    // 只有当密码存在且不为空时才添加密码配置
    if (password && password.trim() !== '') {
      config.password = password;
    }

    const redisStoreInstance = await redisStore(config);

    return {
      store: redisStoreInstance as any,
      ttl: 60 * 60, // 1小时
    };
  }
}
