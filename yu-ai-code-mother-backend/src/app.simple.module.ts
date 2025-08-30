import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 核心模块
import { AiModule } from './modules/ai/ai.module';
import { AppsModule } from './modules/apps/apps.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatHistoryModule } from './modules/chat-history/chat-history.module';

// 基础设施模块 - 暂时注释掉有问题的模块
import { CacheModule } from './modules/cache/cache.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { WebAutomationModule } from './modules/web-automation/web-automation.module';
// import { GatewayModule } from './gateway/gateway.module';
// import { ConfigCenterModule } from './microservices/config/config-center.module';

// 功能模块
import { StaticModule } from './modules/static/static.module';
import { ExceptionModule } from './modules/exception/exception.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 数据库模块 - 暂时注释掉，避免数据库连接问题
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT) || 5432,
    //   username: process.env.DB_USERNAME || 'postgres',
    //   password: process.env.DB_PASSWORD || 'password',
    //   database: process.env.DB_DATABASE || 'ai_code_mother',
    //   autoLoadEntities: true,
    //   synchronize: process.env.NODE_ENV !== 'production',
    // }),

    // 核心业务模块
    AiModule,
    AppsModule,
    UsersModule,
    AuthModule,
    ChatHistoryModule,

    // 基础设施模块 - 暂时注释掉有问题的模块
    CacheModule,
    MonitoringModule,
    WebAutomationModule,
    // GatewayModule,
    // ConfigCenterModule,

    // 功能模块
    StaticModule,
    ExceptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppSimpleModule {}