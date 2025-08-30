import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiCodeGeneratorService } from './services/ai-code-generator.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiCodeGeneratorService,
  ],
  exports: [
    AiService,
    AiCodeGeneratorService,
  ],
})
export class AiModule {}