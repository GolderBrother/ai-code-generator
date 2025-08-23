import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class RouterNode implements WorkflowNode {
  name = 'Router';
  type: 'decision' = 'decision';

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const userRequest = context.userRequest || context.originalPrompt;
    
    // 根据用户请求决定代码生成策略
    const strategy = await this.determineStrategy(userRequest);
    
    return {
      ...context,
      codeGenStrategy: strategy,
      currentStep: 'router',
      stepResults: {
        ...context.stepResults,
        ['router']: {
          selectedStrategy: strategy,
          reason: this.getStrategyReason(strategy),
          timestamp: new Date(),
        }
      }
    };
  }

  private async determineStrategy(userRequest: string): Promise<string> {
    const request = userRequest.toLowerCase();
    
    if (request.includes('vue') || request.includes('组件')) {
      return 'vue-project';
    } else if (request.includes('react')) {
      return 'react-project';
    } else if (request.includes('多文件') || request.includes('项目')) {
      return 'multi-file';
    } else {
      return 'html-static';
    }
  }

  private getStrategyReason(strategy: string): string {
    const reasons = {
      'vue-project': '检测到Vue相关关键词，选择Vue项目生成策略',
      'react-project': '检测到React相关关键词，选择React项目生成策略',
      'multi-file': '检测到多文件项目需求，选择多文件生成策略',
      'html-static': '默认选择HTML静态页面生成策略'
    };
    
    return reasons[strategy] || '使用默认策略';
  }
}