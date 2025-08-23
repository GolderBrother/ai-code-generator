import { Injectable } from '@nestjs/common';
import { Observable, interval, map, take } from 'rxjs';
import { WorkflowExecutorService } from './services/workflow-executor.service';
import { WorkflowContext } from './types/workflow-context.interface';
import { WorkflowType } from './types/workflow-type.enum';

@Injectable()
export class LangGraphService {
  constructor(private readonly workflowExecutor: WorkflowExecutorService) {}

  /**
   * 执行标准代码生成工作流
   */
  async executeWorkflow(originalPrompt: string): Promise<WorkflowContext> {
    console.log('开始执行标准代码生成工作流:', originalPrompt);
    return this.workflowExecutor.executeWorkflow(WorkflowType.STANDARD, originalPrompt);
  }

  /**
   * 执行并发代码生成工作流
   */
  async executeConcurrentWorkflow(originalPrompt: string): Promise<WorkflowContext> {
    console.log('开始执行并发代码生成工作流:', originalPrompt);
    return this.workflowExecutor.executeWorkflow(WorkflowType.CONCURRENT, originalPrompt);
  }

  /**
   * 执行子图工作流
   */
  async executeSubgraphWorkflow(originalPrompt: string): Promise<WorkflowContext> {
    console.log('开始执行子图工作流:', originalPrompt);
    return this.workflowExecutor.executeWorkflow(WorkflowType.SUBGRAPH, originalPrompt);
  }

  /**
   * Flux 流式执行工作流
   */
  executeWorkflowWithFlux(originalPrompt: string): Observable<any> {
    console.log('开始 Flux 流式执行工作流:', originalPrompt);
    
    return interval(1000).pipe(
      take(8),
      map((index) => {
        const steps = [
          '初始化工作流',
          '收集图片素材',
          '增强提示词',
          '智能路由选择',
          '生成代码',
          '代码质量检查',
          '项目构建',
          '工作流完成'
        ];
        
        return {
          data: JSON.stringify({
            step: index + 1,
            stepName: steps[index] || '未知步骤',
            message: `正在执行: ${steps[index]} - 处理提示词: "${originalPrompt}"`,
            timestamp: new Date().toISOString(),
            progress: Math.round(((index + 1) / steps.length) * 100),
          }),
        };
      })
    );
  }

  /**
   * SSE 流式执行工作流
   */
  executeWorkflowWithSse(originalPrompt: string): Observable<any> {
    console.log('开始 SSE 流式执行工作流:', originalPrompt);
    
    return interval(1200).pipe(
      take(8),
      map((index) => {
        const steps = [
          { name: '初始化工作流', detail: '准备工作流执行环境' },
          { name: '收集图片素材', detail: '搜索和收集相关图片资源' },
          { name: '增强提示词', detail: '优化和丰富用户输入的提示词' },
          { name: '智能路由选择', detail: '根据需求选择最佳代码生成策略' },
          { name: '生成代码', detail: '基于增强提示词生成高质量代码' },
          { name: '代码质量检查', detail: '检查代码质量和规范性' },
          { name: '项目构建', detail: '构建完整的项目结构' },
          { name: '工作流完成', detail: '所有步骤执行完毕' }
        ];
        
        const currentStep = steps[index] || { name: '未知步骤', detail: '执行中...' };
        
        return {
          data: JSON.stringify({
            step: index + 1,
            stepName: currentStep.name,
            stepDetail: currentStep.detail,
            message: `SSE工作流步骤 ${index + 1}: ${currentStep.name}`,
            originalPrompt,
            timestamp: new Date().toISOString(),
            progress: Math.round(((index + 1) / steps.length) * 100),
            isCompleted: index === steps.length - 1,
          }),
        };
      })
    );
  }

  /**
   * 获取工作流图表示
   */
  async getWorkflowGraph(type: 'mermaid' | 'json' = 'mermaid'): Promise<any> {
    if (type === 'mermaid') {
      return {
        type: 'mermaid',
        content: `
graph TD
    A[开始] --> B[图片收集]
    B --> C[提示词增强]
    C --> D[智能路由]
    D --> E[代码生成]
    E --> F[质量检查]
    F --> G{检查结果}
    G -->|通过| H[项目构建]
    G -->|失败| E
    H --> I[结束]
    
    style A fill:#e1f5fe
    style I fill:#e8f5e8
    style G fill:#fff3e0
    style F fill:#fce4ec
        `,
      };
    } else {
      return {
        type: 'json',
        nodes: [
          { id: 'start', label: '开始', type: 'start' },
          { id: 'image_collector', label: '图片收集', type: 'process' },
          { id: 'prompt_enhancer', label: '提示词增强', type: 'process' },
          { id: 'router', label: '智能路由', type: 'process' },
          { id: 'code_generator', label: '代码生成', type: 'process' },
          { id: 'quality_check', label: '质量检查', type: 'process' },
          { id: 'project_builder', label: '项目构建', type: 'process' },
          { id: 'end', label: '结束', type: 'end' },
        ],
        edges: [
          { from: 'start', to: 'image_collector' },
          { from: 'image_collector', to: 'prompt_enhancer' },
          { from: 'prompt_enhancer', to: 'router' },
          { from: 'router', to: 'code_generator' },
          { from: 'code_generator', to: 'quality_check' },
          { from: 'quality_check', to: 'project_builder', condition: 'pass' },
          { from: 'quality_check', to: 'code_generator', condition: 'fail' },
          { from: 'project_builder', to: 'end' },
        ],
      };
    }
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    // 模拟获取工作流状态
    return {
      workflowId,
      status: 'running',
      currentStep: 'code_generator',
      progress: 60,
      startTime: new Date(Date.now() - 30000).toISOString(),
      estimatedEndTime: new Date(Date.now() + 45000).toISOString(),
    };
  }
}