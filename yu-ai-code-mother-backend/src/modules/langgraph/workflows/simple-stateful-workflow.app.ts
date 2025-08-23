import { Injectable } from '@nestjs/common';
import { WorkflowExecutorService } from '../services/workflow-executor.service';
import { StateManagerService } from '../services/state-manager.service';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class SimpleStatefulWorkflowApp {
  constructor(
    private readonly workflowExecutor: WorkflowExecutorService,
    private readonly stateManager: StateManagerService,
  ) {}

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    // 有状态工作流：保存中间状态
    await this.stateManager.saveState(context.workflowId, context);
    
    const steps = [
      'imageCollector',
      'promptEnhancer',
      'codeGenerator',
      'qualityCheck'
    ];

    for (const step of steps) {
      context = await this.workflowExecutor.executeNode(context, step);
      await this.stateManager.saveState(context.workflowId, context);
    }

    return context;
  }

  async getState(workflowId: string): Promise<WorkflowContext | null> {
    return await this.stateManager.getState(workflowId);
  }
}