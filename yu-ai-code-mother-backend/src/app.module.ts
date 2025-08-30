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
import { ChatHistoryModule } from './modules/chat-history/chat-history.module';
import { StaticModule } from './modules/static/static.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { LanggraphModule } from './modules/langgraph/langgraph.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { RateLimiterModule } from './modules/rate-limiter/rate-limiter.module';
import { ProjectModule } from './modules/project/project.module';
import { ExceptionModule } from './modules/exception/exception.module';
import { AppController } from './app.controller';
import { CoreModule } from './modules/core/core.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { ToolsModule } from './modules/tools/tools.module';

/**
 * 应用主模块 - 完整版本，包含所有功能模块
 */
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
    ChatHistoryModule,
    StaticModule,
    WorkflowModule,
    LanggraphModule,
    MonitorModule,
    RateLimiterModule,
    ProjectModule,
    ExceptionModule,

    // 其他
    CoreModule,
    ToolsModule,
    DeployModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }