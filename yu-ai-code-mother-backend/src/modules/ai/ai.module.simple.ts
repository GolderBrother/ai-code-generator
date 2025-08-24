import { Module } from '@nestjs/common';
import { AiCodeGeneratorService } from './ai-code-generator.service';

/**
 * 简化的 AI 模块
 */
@Module({
  providers: [AiCodeGeneratorService],
  exports: [AiCodeGeneratorService],
})
export class AiModule {}