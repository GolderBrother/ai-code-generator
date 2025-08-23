import { Injectable } from '@nestjs/common';
import { WorkflowExecutorService } from '../services/workflow-executor.service';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class CodeGenWorkflowApp {
  constructor(private readonly workflowExecutor: WorkflowExecutorService) {}

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    // 代码生成工作流
    const steps = [
      'imageCollector',
      'promptEnhancer',
      'router', // 路由节点决定生成策略
      'codeGenerator',
      'qualityCheck',
      'projectBuilder'
    ];

    return await this.workflowExecutor.executeSequential(context, steps);
  }
}