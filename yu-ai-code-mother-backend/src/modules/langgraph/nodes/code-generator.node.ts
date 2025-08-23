import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class CodeGeneratorNode implements WorkflowNode {
  name = 'CodeGenerator';
  type: 'process' = 'process';

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const userRequest = context.userRequest || context.originalPrompt;
    const { images, enhancedPrompt } = context;
    
    // 根据用户请求和增强的提示词生成代码
    const generatedCode = await this.generateCode(userRequest, enhancedPrompt, images);
    
    return {
      ...context,
      generatedCode,
      currentStep: 'codeGenerator',
      stepResults: {
        ...context.stepResults,
        ['codeGenerator']: {
          code: generatedCode,
          timestamp: new Date(),
        }
      }
    };
  }

  private async generateCode(userRequest: string, enhancedPrompt: string, images: any[]): Promise<{ files: any[] }> {
    // 这里应该调用 AI 服务生成代码
    // 暂时返回模拟代码
    return {
      files: [
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <title>Generated App</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Generated Application</h1>
    <p>Based on: ${userRequest}</p>
    <!-- Generated content based on images and enhanced prompt -->
  </div>
</body>
</html>`
        }
      ]
    };
  }
}