import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class CodeQualityCheckNode implements WorkflowNode {
  name = 'CodeQualityCheck';
  type: 'validation' = 'validation';

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const { generatedCode } = context;
    
    if (!generatedCode || !generatedCode.files || generatedCode.files.length === 0) {
      throw new Error('No generated code to check');
    }
    
    // 执行代码质量检查
    const qualityResult = await this.checkCodeQuality(generatedCode.files[0].content);
    
    return {
      ...context,
      qualityResult,
      currentStep: 'qualityCheck',
      stepResults: {
        ...context.stepResults,
        ['qualityCheck']: {
          score: qualityResult.score,
          issues: qualityResult.issues,
          suggestions: qualityResult.suggestions,
          timestamp: new Date(),
        }
      }
    };
  }

  private async checkCodeQuality(code: string): Promise<any> {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // 基本的代码质量检查
    if (!code.includes('<!DOCTYPE html>')) {
      issues.push('缺少DOCTYPE声明');
      score -= 10;
    }

    if (!code.includes('<title>')) {
      issues.push('缺少页面标题');
      score -= 5;
    }

    if (code.includes('style=')) {
      suggestions.push('建议将内联样式提取到CSS文件中');
      score -= 5;
    }

    if (!code.includes('viewport')) {
      suggestions.push('建议添加viewport meta标签以支持响应式设计');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      issues,
      suggestions,
      passed: score >= 70
    };
  }
}