import { Injectable } from '@nestjs/common';
import { NodeFactoryService } from './node-factory.service';
import { StateManagerService } from './state-manager.service';
import { WorkflowContext } from '../types/workflow-context.interface';
import { WorkflowType } from '../types/workflow-type.enum';
import { WorkflowNode } from '../types/workflow-node.interface';

@Injectable()
export class WorkflowExecutorService {
  constructor(
    private readonly nodeFactory: NodeFactoryService,
    private readonly stateManager: StateManagerService,
  ) {}

  /**
   * 执行工作流
   */
  async executeWorkflow(type: WorkflowType, originalPrompt: string): Promise<WorkflowContext> {
    console.log(`开始执行工作流类型: ${type}, 提示词: ${originalPrompt}`);
    
    // 初始化工作流上下文
    const context = this.stateManager.createContext(originalPrompt);
    
    try {
      switch (type) {
        case WorkflowType.STANDARD:
          return await this.executeStandardWorkflow(context);
        case WorkflowType.CONCURRENT:
          return await this.executeConcurrentWorkflow(context);
        case WorkflowType.SUBGRAPH:
          return await this.executeSubgraphWorkflow(context);
        default:
          throw new Error(`不支持的工作流类型: ${type}`);
      }
    } catch (error) {
      console.error('工作流执行失败:', error);
      context.status = 'failed';
      context.error = error.message;
      return context;
    }
  }

  /**
   * 执行标准工作流
   */
  private async executeStandardWorkflow(context: WorkflowContext): Promise<WorkflowContext> {
    console.log('执行标准工作流');
    
    const nodes = [
      this.nodeFactory.createImageCollectorNode(),
      this.nodeFactory.createPromptEnhancerNode(),
      this.nodeFactory.createRouterNode(),
      this.nodeFactory.createCodeGeneratorNode(),
      this.nodeFactory.createCodeQualityCheckNode(),
      this.nodeFactory.createProjectBuilderNode(),
    ];

    for (const node of nodes) {
      console.log(`执行节点: ${node.name}`);
      context.currentStep = node.name;
      context = await node.execute(context);
      
      if (context.status === 'failed') {
        break;
      }
    }

    context.status = context.status === 'failed' ? 'failed' : 'completed';
    return context;
  }

  /**
   * 执行并发工作流
   */
  private async executeConcurrentWorkflow(context: WorkflowContext): Promise<WorkflowContext> {
    console.log('执行并发工作流');
    
    // 并发执行图片收集和提示词增强
    const [imageResult, promptResult] = await Promise.all([
      this.nodeFactory.createImageCollectorNode().execute(context),
      this.nodeFactory.createPromptEnhancerNode().execute(context),
    ]);

    // 合并结果
    context.images = imageResult.images;
    context.enhancedPrompt = promptResult.enhancedPrompt;

    // 继续执行后续节点
    const remainingNodes = [
      this.nodeFactory.createRouterNode(),
      this.nodeFactory.createCodeGeneratorNode(),
      this.nodeFactory.createCodeQualityCheckNode(),
      this.nodeFactory.createProjectBuilderNode(),
    ];

    for (const node of remainingNodes) {
      console.log(`执行节点: ${node.name}`);
      context.currentStep = node.name;
      context = await node.execute(context);
      
      if (context.status === 'failed') {
        break;
      }
    }

    context.status = context.status === 'failed' ? 'failed' : 'completed';
    return context;
  }

  /**
   * 执行子图工作流
   */
  private async executeSubgraphWorkflow(context: WorkflowContext): Promise<WorkflowContext> {
    console.log('执行子图工作流');
    
    // 预处理子图
    const preprocessNodes = [
      this.nodeFactory.createImageCollectorNode(),
      this.nodeFactory.createPromptEnhancerNode(),
    ];

    for (const node of preprocessNodes) {
      console.log(`执行预处理节点: ${node.name}`);
      context.currentStep = `preprocess_${node.name}`;
      context = await node.execute(context);
    }

    // 主处理子图
    const mainProcessNodes = [
      this.nodeFactory.createRouterNode(),
      this.nodeFactory.createCodeGeneratorNode(),
    ];

    for (const node of mainProcessNodes) {
      console.log(`执行主处理节点: ${node.name}`);
      context.currentStep = `main_${node.name}`;
      context = await node.execute(context);
    }

    // 后处理子图
    const postProcessNodes = [
      this.nodeFactory.createCodeQualityCheckNode(),
      this.nodeFactory.createProjectBuilderNode(),
    ];

    for (const node of postProcessNodes) {
      console.log(`执行后处理节点: ${node.name}`);
      context.currentStep = `post_${node.name}`;
      context = await node.execute(context);
    }

    context.status = 'completed';
    return context;
  }

  /**
   * 顺序执行多个步骤
   */
  async executeSequential(context: WorkflowContext, steps: string[]): Promise<WorkflowContext> {
    let currentContext = { ...context };
    
    for (const step of steps) {
      currentContext = await this.executeNode(currentContext, step);
      if (currentContext.status === 'failed') {
        break;
      }
    }
    
    return currentContext;
  }

  /**
   * 执行单个节点
   */
  async executeNode(context: WorkflowContext, nodeType: string): Promise<WorkflowContext> {
    let node: WorkflowNode;
    
    switch (nodeType) {
      case 'imageCollector':
        node = this.nodeFactory.createImageCollectorNode();
        break;
      case 'promptEnhancer':
        node = this.nodeFactory.createPromptEnhancerNode();
        break;
      case 'router':
        node = this.nodeFactory.createRouterNode();
        break;
      case 'codeGenerator':
        node = this.nodeFactory.createCodeGeneratorNode();
        break;
      case 'qualityCheck':
        node = this.nodeFactory.createCodeQualityCheckNode();
        break;
      case 'projectBuilder':
        node = this.nodeFactory.createProjectBuilderNode();
        break;
      default:
        throw new Error(`未知的节点类型: ${nodeType}`);
    }
    
    return await node.execute(context);
  }

  /**
   * 并发执行多个步骤
   */
  async executeConcurrent(context: WorkflowContext, steps: string[]): Promise<WorkflowContext> {
    const promises = steps.map(step => this.executeNode({ ...context }, step));
    const results = await Promise.all(promises);
    
    // 合并所有结果
    return results.reduce((merged, result) => ({
      ...merged,
      ...result,
      stepResults: {
        ...merged.stepResults,
        ...result.stepResults
      }
    }), context);
  }
}
