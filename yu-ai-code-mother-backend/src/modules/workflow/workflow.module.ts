import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

/**
 * 工作流模块
 * 对齐Java版本的LangGraph4j工作流功能
 */
@Module({
  imports: [ConfigModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
  ],
  exports: [
    WorkflowService,
  ],
})
export class WorkflowModule {}