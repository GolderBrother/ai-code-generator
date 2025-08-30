import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiCodeGeneratorService } from './services/ai-code-generator.service';

/**
 * AI模块 - 简化版本
 * 专注于核心代码生成功能
 */
@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiCodeGeneratorService,
  ],
  exports: [AiService, AiCodeGeneratorService],
})
export class AiSimpleModule {}