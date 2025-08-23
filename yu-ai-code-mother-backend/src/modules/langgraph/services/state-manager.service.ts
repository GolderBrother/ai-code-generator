import { Injectable } from '@nestjs/common';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class StateManagerService {
  private contexts: Map<string, WorkflowContext> = new Map();

  /**
   * 创建新的工作流上下文
   */
  createContext(originalPrompt: string): WorkflowContext {
    const workflowId = this.generateWorkflowId();
    
    const context: WorkflowContext = {
      workflowId,
      originalPrompt,
      userRequest: originalPrompt,
      requirement: originalPrompt,
      enhancedPrompt: '',
      status: 'running',
      currentStep: 'init',
      startTime: new Date().toISOString(),
      stepResults: {},
      images: [],
      codeGenStrategy: 'multi-file',
      generatedCode: { files: [] },
      qualityCheck: { score: 0, passed: false, issues: [] },
      qualityResult: { score: 0, passed: false, issues: [] },
      buildResult: { success: false, outputPath: '', deployUrl: '' },
    };

    this.contexts.set(workflowId, context);
    return context;
  }

  /**
   * 获取工作流上下文
   */
  getContext(workflowId: string): WorkflowContext | undefined {
    return this.contexts.get(workflowId);
  }

  /**
   * 更新工作流上下文
   */
  updateContext(workflowId: string, context: WorkflowContext): void {
    this.contexts.set(workflowId, context);
  }

  /**
   * 删除工作流上下文
   */
  deleteContext(workflowId: string): void {
    this.contexts.delete(workflowId);
  }

  /**
   * 清理过期的上下文（超过1小时）
   */
  cleanupExpiredContexts(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [workflowId, context] of this.contexts.entries()) {
      const startTime = new Date(context.startTime);
      if (startTime < oneHourAgo) {
        this.contexts.delete(workflowId);
      }
    }
  }

  /**
   * 生成工作流ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取所有活跃的工作流
   */
  getActiveWorkflows(): WorkflowContext[] {
    return Array.from(this.contexts.values()).filter(
      context => context.status === 'running'
    );
  }

  /**
   * 获取工作流统计信息
   */
  getWorkflowStats(): {
    total: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const contexts = Array.from(this.contexts.values());
    
    return {
      total: contexts.length,
      running: contexts.filter(c => c.status === 'running').length,
      completed: contexts.filter(c => c.status === 'completed').length,
      failed: contexts.filter(c => c.status === 'failed').length,
    };
  }

  /**
   * 保存工作流状态
   */
  async saveState(workflowId: string, context: WorkflowContext): Promise<void> {
    this.contexts.set(workflowId, { ...context });
  }

  /**
   * 获取工作流状态
   */
  async getState(workflowId: string): Promise<WorkflowContext | null> {
    return this.contexts.get(workflowId) || null;
  }

  /**
   * 删除工作流状态
   */
  async deleteState(workflowId: string): Promise<void> {
    this.contexts.delete(workflowId);
  }
}
