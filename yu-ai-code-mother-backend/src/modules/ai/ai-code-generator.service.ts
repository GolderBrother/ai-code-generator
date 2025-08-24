import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * AI 代码生成服务
 */
@Injectable()
export class AiCodeGeneratorService {
  /**
   * 生成代码（通用方法）
   */
  async generateCode(prompt: string, codeType: string = 'html'): Promise<string> {
    // 模拟 AI 代码生成
    return this.mockGenerateCode(prompt, codeType);
  }

  /**
   * 生成代码流（通用方法）
   */
  generateCodeStream(prompt: string, codeType: string = 'html'): Observable<string> {
    return new Observable(subscriber => {
      const mockResponse = this.mockGenerateCode(prompt, codeType);
      const chunks = mockResponse.split('\n');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          subscriber.next(chunks[index] + '\n');
          index++;
        } else {
          clearInterval(interval);
          subscriber.complete();
        }
      }, 100);
    });
  }

  /**
   * 生成 HTML 代码
   */
  async generateHtmlCode(prompt: string): Promise<{ htmlCode: string }> {
    const htmlCode = await this.generateCode(prompt, 'html');
    return { htmlCode };
  }

  /**
   * 生成 HTML 代码流
   */
  generateHtmlCodeStream(prompt: string): Observable<string> {
    return this.generateCodeStream(prompt, 'html');
  }

  /**
   * 生成多文件代码
   */
  async generateMultiFileCode(prompt: string): Promise<{
    htmlCode: string;
    cssCode?: string;
    jsCode?: string;
  }> {
    const htmlCode = await this.generateCode(prompt, 'html');
    const cssCode = await this.generateCode(prompt, 'css');
    const jsCode = await this.generateCode(prompt, 'js');
    
    return { htmlCode, cssCode, jsCode };
  }

  /**
   * 生成多文件代码流
   */
  generateMultiFileCodeStream(prompt: string): Observable<string> {
    return this.generateCodeStream(prompt, 'multi_file');
  }

  /**
   * 生成 Vue 项目代码
   */
  async generateVueProjectCode(prompt: string): Promise<{ projectContent: string }> {
    const projectContent = await this.generateCode(prompt, 'vue_project');
    return { projectContent };
  }

  /**
   * 生成 Vue 项目代码流
   */
  generateVueProjectCodeStream(prompt: string): Observable<string> {
    return this.generateCodeStream(prompt, 'vue_project');
  }

  /**
   * 模拟代码生成
   */
  private mockGenerateCode(prompt: string, codeType: string): string {
    switch (codeType) {
      case 'html':
        return this.generateMockHtml(prompt);
      case 'css':
        return this.generateMockCss(prompt);
      case 'js':
        return this.generateMockJs(prompt);
      case 'multi_file':
        return this.generateMockMultiFile(prompt);
      case 'vue_project':
        return this.generateMockVueProject(prompt);
      default:
        return this.generateMockHtml(prompt);
    }
  }

  /**
   * 生成模拟 HTML
   */
  private generateMockHtml(prompt: string): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 生成的应用</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .prompt-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 AI 生成的应用</h1>
        <div class="prompt-info">
            <h3>用户需求</h3>
            <p>${prompt}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn" onclick="showDemo()">点击体验功能</button>
        </div>
        <div style="margin-top: 30px; color: #666; font-size: 0.9em; text-align: center;">
            生成时间: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
    
    <script>
        function showDemo() {
            alert('功能演示：根据您的需求"${prompt}"生成的应用');
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('AI 生成的应用已加载完成');
            console.log('用户需求:', '${prompt}');
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成模拟 CSS
   */
  private generateMockCss(prompt: string): string {
    return `/* AI 生成的样式文件 */
/* 用户需求: ${prompt} */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.btn {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}`;
  }

  /**
   * 生成模拟 JavaScript
   */
  private generateMockJs(prompt: string): string {
    return `// AI 生成的 JavaScript 文件
// 用户需求: ${prompt}

class AppManager {
  constructor() {
    this.userPrompt = '${prompt}';
    this.init();
  }
  
  init() {
    console.log('应用已初始化，用户需求:', this.userPrompt);
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn')) {
        this.handleButtonClick(e.target);
      }
    });
  }
  
  handleButtonClick(button) {
    const action = button.dataset.action || 'demo';
    console.log('执行操作:', action);
    
    switch(action) {
      case 'demo':
        this.showDemo();
        break;
      default:
        this.showMessage('按钮被点击了！');
    }
  }
  
  showDemo() {
    alert('演示功能：' + this.userPrompt);
  }
  
  showMessage(message) {
    console.log(message);
    // 可以在这里添加更多的消息显示逻辑
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.appManager = new AppManager();
});`;
  }

  /**
   * 生成模拟多文件代码
   */
  private generateMockMultiFile(prompt: string): string {
    return `\`\`\`html
${this.generateMockHtml(prompt)}
\`\`\`

\`\`\`css
${this.generateMockCss(prompt)}
\`\`\`

\`\`\`js
${this.generateMockJs(prompt)}
\`\`\``;
  }

  /**
   * 生成模拟 Vue 项目
   */
  private generateMockVueProject(prompt: string): string {
    return `# Vue 项目说明

用户需求: ${prompt}

这是一个基于 Vue 3 的项目，根据您的需求自动生成。

## 项目结构
- src/App.vue - 主应用组件
- src/main.js - 应用入口文件
- package.json - 项目配置文件

## 运行方式
1. npm install
2. npm run dev

生成时间: ${new Date().toLocaleString('zh-CN')}`;
  }
}