import { Injectable } from '@nestjs/common';
import { WorkflowExecutorService } from '../services/workflow-executor.service';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class SimpleWorkflowApp {
  constructor(private readonly workflowExecutor: WorkflowExecutorService) {}

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    // 简单工作流：图片收集 -> 提示词增强 -> 代码生成
    const steps = [
      'imageCollector',
      'promptEnhancer', 
      'codeGenerator'
    ];

    return await this.workflowExecutor.executeSequential(context, steps);
  }
}