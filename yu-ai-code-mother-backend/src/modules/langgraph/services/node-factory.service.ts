import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { ImageCollectorNode } from '../nodes/image-collector.node';
import { PromptEnhancerNode } from '../nodes/prompt-enhancer.node';
import { RouterNode } from '../nodes/router.node';
import { CodeGeneratorNode } from '../nodes/code-generator.node';
import { CodeQualityCheckNode } from '../nodes/code-quality-check.node';
import { ProjectBuilderNode } from '../nodes/project-builder.node';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class NodeFactoryService {
  constructor(
    private readonly imageCollectorNode: ImageCollectorNode,
    private readonly promptEnhancerNode: PromptEnhancerNode,
    private readonly routerNode: RouterNode,
    private readonly codeGeneratorNode: CodeGeneratorNode,
    private readonly codeQualityCheckNode: CodeQualityCheckNode,
    private readonly projectBuilderNode: ProjectBuilderNode,
  ) {}

  createNode(nodeType: string): WorkflowNode {
    switch (nodeType) {
      case 'imageCollector':
        return this.imageCollectorNode;
      case 'promptEnhancer':
        return this.promptEnhancerNode;
      case 'router':
        return this.routerNode;
      case 'codeGenerator':
        return this.codeGeneratorNode;
      case 'qualityCheck':
        return this.codeQualityCheckNode;
      case 'projectBuilder':
        return this.projectBuilderNode;
      default:
        throw new Error(`未知的节点类型: ${nodeType}`);
    }
  }
  
  /**
   * 创建图片收集节点
   */
  createImageCollectorNode(): WorkflowNode {
    return {
      name: 'ImageCollector',
      type: 'process',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行图片收集节点');
        
        // 模拟图片收集逻辑
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        context.images = [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
        ];
        
        context.stepResults.push({
          step: 'ImageCollector',
          success: true,
          message: '成功收集到 3 张相关图片',
          timestamp: new Date().toISOString(),
        });
        
        return context;
      }
    };
  }

  /**
   * 创建提示词增强节点
   */
  createPromptEnhancerNode(): WorkflowNode {
    return {
      name: 'PromptEnhancer',
      type: 'process',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行提示词增强节点');
        
        // 模拟提示词增强逻辑
        await new Promise(resolve => setTimeout(resolve, 800));
        
        context.enhancedPrompt = `增强后的提示词: ${context.originalPrompt}
        
请生成一个现代化的、响应式的Web应用，包含以下特性：
1. 使用现代前端框架（Vue3/React）
2. 具有良好的用户体验和界面设计
3. 包含完整的项目结构和配置文件
4. 添加必要的依赖和工具链配置
5. 确保代码质量和可维护性`;
        
        context.stepResults.push({
          step: 'PromptEnhancer',
          success: true,
          message: '提示词增强完成，添加了技术规范和最佳实践要求',
          timestamp: new Date().toISOString(),
        });
        
        return context;
      }
    };
  }

  /**
   * 创建智能路由节点
   */
  createRouterNode(): WorkflowNode {
    return {
      name: 'Router',
      type: 'decision',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行智能路由节点');
        
        // 模拟路由决策逻辑
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 根据提示词内容决定代码生成策略
        const prompt = context.enhancedPrompt.toLowerCase();
        
        if (prompt.includes('vue') || prompt.includes('前端')) {
          context.codeGenStrategy = 'vue-project';
        } else if (prompt.includes('react')) {
          context.codeGenStrategy = 'react-project';
        } else if (prompt.includes('html') || prompt.includes('静态')) {
          context.codeGenStrategy = 'html-static';
        } else {
          context.codeGenStrategy = 'multi-file';
        }
        
        context.stepResults.push({
          step: 'Router',
          success: true,
          message: `选择代码生成策略: ${context.codeGenStrategy}`,
          timestamp: new Date().toISOString(),
        });
        
        return context;
      }
    };
  }

  /**
   * 创建代码生成节点
   */
  createCodeGeneratorNode(): WorkflowNode {
    return {
      name: 'CodeGenerator',
      type: 'process',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行代码生成节点');
        
        // 模拟代码生成逻辑
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 根据策略生成不同类型的代码
        switch (context.codeGenStrategy) {
          case 'vue-project':
            context.generatedCode = this.generateVueProject(context);
            break;
          case 'react-project':
            context.generatedCode = this.generateReactProject(context);
            break;
          case 'html-static':
            context.generatedCode = this.generateHtmlProject(context);
            break;
          default:
            context.generatedCode = this.generateMultiFileProject(context);
        }
        
        context.stepResults.push({
          step: 'CodeGenerator',
          success: true,
          message: `成功生成 ${context.generatedCode.files.length} 个文件`,
          timestamp: new Date().toISOString(),
        });
        
        return context;
      }
    };
  }

  /**
   * 创建代码质量检查节点
   */
  createCodeQualityCheckNode(): WorkflowNode {
    return {
      name: 'CodeQualityCheck',
      type: 'validation',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行代码质量检查节点');
        
        // 模拟代码质量检查
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const qualityScore = Math.random() * 40 + 60; // 60-100分
        const passed = qualityScore >= 70;
        
        context.qualityCheck = {
          score: Math.round(qualityScore),
          passed,
          issues: passed ? [] : ['代码复杂度过高', '缺少注释', '变量命名不规范'],
        };
        
        context.stepResults.push({
          step: 'CodeQualityCheck',
          success: passed,
          message: `代码质量检查${passed ? '通过' : '失败'}，得分: ${context.qualityCheck.score}`,
          timestamp: new Date().toISOString(),
        });
        
        if (!passed) {
          context.status = 'failed';
        }
        
        return context;
      }
    };
  }

  /**
   * 创建项目构建节点
   */
  createProjectBuilderNode(): WorkflowNode {
    return {
      name: 'ProjectBuilder',
      type: 'process',
      async execute(context: WorkflowContext): Promise<WorkflowContext> {
        console.log('执行项目构建节点');
        
        // 模拟项目构建
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        context.buildResult = {
          success: true,
          outputPath: `/tmp/generated-project-${Date.now()}`,
          deployUrl: `https://generated-app-${Date.now()}.example.com`,
        };
        
        context.stepResults.push({
          step: 'ProjectBuilder',
          success: true,
          message: `项目构建成功，部署地址: ${context.buildResult.deployUrl}`,
          timestamp: new Date().toISOString(),
        });
        
        return context;
      }
    };
  }

  /**
   * 生成Vue项目代码
   */
  private generateVueProject(context: WorkflowContext) {
    return {
      files: [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'generated-vue-app',
            version: '1.0.0',
            dependencies: {
              'vue': '^3.3.0',
              '@vitejs/plugin-vue': '^4.0.0',
              'vite': '^4.0.0'
            }
          }, null, 2)
        },
        {
          path: 'src/App.vue',
          content: `<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Generated Vue App')
const description = ref('${context.originalPrompt}')
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`
        }
      ]
    };
  }

  /**
   * 生成React项目代码
   */
  private generateReactProject(context: WorkflowContext) {
    return {
      files: [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'generated-react-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0'
            }
          }, null, 2)
        },
        {
          path: 'src/App.jsx',
          content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Generated React App</h1>
      <p>${context.originalPrompt}</p>
    </div>
  );
}

export default App;`
        }
      ]
    };
  }

  /**
   * 生成HTML项目代码
   */
  private generateHtmlProject(context: WorkflowContext) {
    return {
      files: [
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated HTML App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Generated HTML App</h1>
    <p>${context.originalPrompt}</p>
</body>
</html>`
        }
      ]
    };
  }

  /**
   * 生成多文件项目代码
   */
  private generateMultiFileProject(context: WorkflowContext) {
    return {
      files: [
        {
          path: 'README.md',
          content: `# Generated Project

${context.originalPrompt}

## 项目结构

- index.html - 主页面
- style.css - 样式文件
- script.js - 脚本文件
`
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Generated Project</h1>
        <p>${context.originalPrompt}</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`
        },
        {
          path: 'style.css',
          content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`
        },
        {
          path: 'script.js',
          content: `console.log('Generated project loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
});`
        }
      ]
    };
  }
}