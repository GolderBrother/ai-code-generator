import { WorkflowContext } from './workflow-context.interface';

export interface WorkflowNode {
  name: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'validation';
  execute(context: WorkflowContext): Promise<WorkflowContext>;
}

export interface WorkflowNodeInfo {
  name: string;
  type: 'process' | 'decision' | 'validation';
}
