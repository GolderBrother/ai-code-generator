import { Module } from '@nestjs/common';
import { ToolExecutorService } from './services/tool-executor.service';

@Module({
  providers: [ToolExecutorService],
  exports: [ToolExecutorService],
})
export class ToolsModule {}