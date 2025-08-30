import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 只包含核心AI模块
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 核心AI模块
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppMinimalModule {}