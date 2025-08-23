import { Injectable } from '@nestjs/common';
import { WorkflowNode } from '../types/workflow-node.interface';
import { WorkflowContext } from '../types/workflow-context.interface';

@Injectable()
export class ProjectBuilderNode implements WorkflowNode {
  name = 'ProjectBuilder';
  type: 'process' = 'process';

  async execute(context: WorkflowContext): Promise<WorkflowContext> {
    const { generatedCode, codeGenStrategy } = context;
    
    if (!generatedCode || !generatedCode.files || generatedCode.files.length === 0) {
      throw new Error('No generated code to build');
    }
    
    // 根据策略构建项目
    const projectStructure = await this.buildProject(generatedCode.files[0].content, codeGenStrategy);
    
    return {
      ...context,
      projectStructure,
      currentStep: 'projectBuilder',
      stepResults: {
        ...context.stepResults,
        ['projectBuilder']: {
          strategy: codeGenStrategy,
          fileCount: projectStructure.files.length,
          projectSize: this.calculateProjectSize(projectStructure),
          timestamp: new Date(),
        }
      }
    };
  }

  private async buildProject(code: string, strategy: string): Promise<any> {
    const files = [];
    
    switch (strategy) {
      case 'vue-project':
        files.push(
          { path: 'index.html', content: this.generateVueHTML() },
          { path: 'src/App.vue', content: code },
          { path: 'src/main.js', content: this.generateVueMain() },
          { path: 'package.json', content: this.generateVuePackageJson() }
        );
        break;
        
      case 'react-project':
        files.push(
          { path: 'public/index.html', content: this.generateReactHTML() },
          { path: 'src/App.js', content: code },
          { path: 'src/index.js', content: this.generateReactMain() },
          { path: 'package.json', content: this.generateReactPackageJson() }
        );
        break;
        
      case 'multi-file':
        files.push(
          { path: 'index.html', content: code },
          { path: 'styles/main.css', content: this.extractCSS(code) },
          { path: 'scripts/main.js', content: this.extractJS(code) }
        );
        break;
        
      default: // html-static
        files.push({ path: 'index.html', content: code });
        break;
    }
    
    return {
      files,
      strategy,
      buildTime: new Date()
    };
  }

  private generateVueHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
  }

  private generateVueMain(): string {
    return `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;
  }

  private generateVuePackageJson(): string {
    return JSON.stringify({
      name: 'vue-generated-app',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.3.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.4.0',
        vite: '^4.4.0'
      }
    }, null, 2);
  }

  private generateReactHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }

  private generateReactMain(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
  }

  private generateReactPackageJson(): string {
    return JSON.stringify({
      name: 'react-generated-app',
      version: '1.0.0',
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '5.0.1'
      }
    }, null, 2);
  }

  private extractCSS(html: string): string {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1].trim() : '';
  }

  private extractJS(html: string): string {
    const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return scriptMatch ? scriptMatch[1].trim() : '';
  }

  private calculateProjectSize(projectStructure: any): number {
    return projectStructure.files.reduce((total, file) => {
      return total + (file.content?.length || 0);
    }, 0);
  }
}