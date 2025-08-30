import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * AI 代码生成服务
 * 简化版本，不依赖 LangChain
 */
@Injectable()
export class AiCodeGeneratorService {
  private readonly logger = new Logger(AiCodeGeneratorService.name);

  /**
   * 生成 HTML 代码
   */
  async generateHtmlCode(userMessage: string): Promise<string> {
    this.logger.log(`生成HTML代码: ${userMessage}`);
    
    // 模拟代码生成逻辑
    const htmlCode = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的页面</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { 
            color: #fff; 
            text-align: center; 
            margin-bottom: 30px;
        }
        p { 
            line-height: 1.6; 
            color: #f0f0f0; 
            margin-bottom: 15px;
        }
        .feature-box {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>基于需求生成的页面</h1>
        <p><strong>用户需求:</strong> ${userMessage}</p>
        <div class="feature-box">
            <p>这是一个由AI生成的HTML页面，根据您的需求定制。</p>
            <p>✨ 现代化设计风格</p>
            <p>📱 响应式布局</p>
            <p>🎨 渐变背景效果</p>
        </div>
        <p>生成时间: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
    
    return htmlCode;
  }

  /**
   * 生成多文件代码项目
   */
  async generateMultiFileCode(userMessage: string): Promise<any> {
    this.logger.log(`生成多文件代码: ${userMessage}`);
    
    return {
      files: [
        {
          name: 'index.html',
          content: await this.generateHtmlCode(userMessage)
        },
        {
          name: 'style.css',
          content: `/* AI生成的样式文件 */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
}

.content {
    background: rgba(255,255,255,0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
}`
        },
        {
          name: 'script.js',
          content: `// AI生成的JavaScript文件
console.log('AI代码生成器启动');

document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    const info = {
        generator: 'AI Code Mother',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        userRequest: '${userMessage}'
    };
    
    console.log('生成信息:', info);
});`
        }
      ],
      metadata: {
        generator: 'AI Code Mother',
        type: 'multi-file',
        timestamp: new Date().toISOString(),
        userRequest: userMessage
      }
    };
  }

  /**
   * 生成 Vue 项目代码
   */
  async generateVueProjectCode(userMessage: string): Promise<any> {
    this.logger.log(`生成Vue项目代码: ${userMessage}`);
    
    return {
      files: [
        {
          name: 'App.vue',
          content: `<template>
  <div id="app">
    <header class="header">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </header>
    
    <main class="main-content">
      <div class="user-request">
        <h3>用户需求</h3>
        <p>{{ userRequest }}</p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      title: 'AI生成的Vue应用',
      description: '基于用户需求自动生成的Vue.js应用程序',
      userRequest: '${userMessage}'
    }
  },
  mounted() {
    console.log('Vue应用已挂载');
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.header {
  text-align: center;
  padding: 40px 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-request {
  background: rgba(255,255,255,0.2);
  padding: 20px;
  margin: 30px 0;
  border-radius: 10px;
}
</style>`
        }
      ],
      metadata: {
        generator: 'AI Code Mother',
        type: 'vue-project',
        timestamp: new Date().toISOString(),
        userRequest: userMessage
      }
    };
  }

  /**
   * 流式生成 HTML 代码
   */
  generateHtmlCodeStream(userMessage: string): Observable<string> {
    this.logger.log(`流式生成HTML代码: ${userMessage}`);
    
    return of(`正在为"${userMessage}"生成HTML代码...`).pipe(
      catchError(error => {
        this.logger.error('流式生成HTML代码失败:', error);
        return of(`生成失败: ${error.message}`);
      })
    );
  }

  /**
   * 流式生成多文件代码
   */
  generateMultiFileCodeStream(userMessage: string): Observable<string> {
    this.logger.log(`流式生成多文件代码: ${userMessage}`);
    
    return of(`正在为"${userMessage}"生成多文件项目...`).pipe(
      catchError(error => {
        this.logger.error('流式生成多文件代码失败:', error);
        return of(`生成失败: ${error.message}`);
      })
    );
  }

  /**
   * 流式生成 Vue 项目代码
   */
  generateVueProjectCodeStream(userMessage: string): Observable<string> {
    this.logger.log(`流式生成Vue项目代码: ${userMessage}`);
    
    return of(`正在为"${userMessage}"生成Vue项目...`).pipe(
      catchError(error => {
        this.logger.error('流式生成Vue项目代码失败:', error);
        return of(`生成失败: ${error.message}`);
      })
    );
  }
}