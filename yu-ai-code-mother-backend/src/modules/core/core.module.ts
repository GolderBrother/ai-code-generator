import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeParserService } from './parser/code-parser.service';

/**
 * 核心模块
 * 对齐Java版本的核心功能
 */
@Module({
  imports: [ConfigModule],
  providers: [
    CodeParserService,
  ],
  exports: [
    CodeParserService,
  ],
})
export class CoreModule {}