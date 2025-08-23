import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

// 配置模块
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

// 公共模块
import { CommonModule } from './common/common.module';
import { HealthModule } from './common/health/health.module';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppsModule } from './modules/apps/apps.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // 缓存模块
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useClass: RedisConfig,
      isGlobal: true,
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 健康检查模块
    TerminusModule,

    // 公共模块
    CommonModule,
    HealthModule,

    // 业务模块
    AuthModule,
    UsersModule,
    AppsModule,
    AiModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
