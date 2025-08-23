import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';
import { ImageSearchTool } from '../tools/image-search.tool';
import { LogoGeneratorTool } from '../tools/logo-generator.tool';

@Injectable()
export class ImageCollectorNode implements WorkflowNode {
  name = 'ImageCollector';
  type: 'process' = 'process';

  constructor(
    private readonly imageSearchTool: ImageSearchTool,
    private readonly logoGeneratorTool: LogoGeneratorTool,
  ) {}

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const requirement = context.userRequest || context.originalPrompt;
    
    // 收集图片资源
    const images = await this.imageSearchTool.searchImages(requirement);
    const logos = await this.logoGeneratorTool.generateLogo(requirement);
    
    context.images = [...images, ...logos];
    context.currentStep = 'imageCollector';
    context.stepResults['imageCollector'] = {
      images: context.images,
      timestamp: new Date(),
    };

    return context;
  }

  getName(): string {
    return 'imageCollector';
  }
}