import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class PromptEnhancerNode implements WorkflowNode {
  name = 'PromptEnhancer';
  type: 'process' = 'process';

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const userRequest = context.userRequest || context.originalPrompt;
    const { images } = context;
    
    // 基于收集的图片增强提示词
    const enhancedPrompt = await this.enhancePrompt(userRequest, images);
    
    return {
      ...context,
      enhancedPrompt,
      currentStep: 'promptEnhancer',
      stepResults: {
        ...context.stepResults,
        ['promptEnhancer']: {
          originalPrompt: userRequest,
          enhancedPrompt,
          imageCount: images?.length || 0,
          timestamp: new Date(),
        }
      }
    };
  }

  private async enhancePrompt(userRequest: string, images: any[]): Promise<string> {
    let enhanced = userRequest;
    
    if (images && images.length > 0) {
      enhanced += `\n\n基于收集到的 ${images.length} 张图片，请：`;
      enhanced += '\n- 参考图片的设计风格和布局';
      enhanced += '\n- 保持视觉一致性';
      enhanced += '\n- 使用合适的颜色搭配';
    }
    
    enhanced += '\n\n请生成高质量、可运行的代码。';
    
    return enhanced;
  }
}