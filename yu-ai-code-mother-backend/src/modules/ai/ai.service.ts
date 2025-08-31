import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * AI 服务 - 对应Java版本的AiManager
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    // 获取OpenAI配置
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
    
    // 检查API Key是否配置
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      this.logger.warn('⚠️  OpenAI API Key未正确配置，请在.env文件中设置OPENAI_API_KEY');
      this.logger.warn('💡 提示：请将.env文件中的OPENAI_API_KEY设置为您的真实OpenAI API密钥');
    }
    
    // 初始化OpenAI客户端
    this.openai = new OpenAI({
      apiKey: apiKey || 'your-api-key-here',
      baseURL: baseURL,
    });
    
    this.logger.log(`🤖 AI服务已初始化，Base URL: ${baseURL}`);
  }

  /**
   * 获取AI服务配置
   */
  getAiConfig() {
    return {
      model: this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo'),
      temperature: this.configService.get<number>('OPENAI_TEMPERATURE', 0.7),
      maxTokens: this.configService.get<number>('OPENAI_MAX_TOKENS', 2000),
    };
  }

  /**
   * 检查AI服务状态
   */
  async checkStatus(): Promise<boolean> {
    try {
      // 测试AI服务连接
      await this.openai.models.list();
      return true;
    } catch (error) {
      this.logger.error(`AI服务状态检查失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 同步稳定请求 - 对应Java版本的doSyncStableRequest方法
   * 这是核心的AI代码生成方法
   */
  async doSyncStableRequest(userInput: string, codeGenType: string = 'html'): Promise<string> {
    this.logger.log(`开始AI同步请求，类型: ${codeGenType}, 输入长度: ${userInput.length}`);
    
    // 检查API Key配置
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here' || apiKey === 'your-api-key-here') {
      const errorMsg = '❌ OpenAI API Key未正确配置！请在.env文件中设置正确的OPENAI_API_KEY';
      this.logger.error(errorMsg);
      
      // 返回模拟的代码生成结果，避免系统崩溃
      return this.generateFallbackCode(userInput, codeGenType);
    }
    
    try {
      const config = this.getAiConfig();
      
      // 构建系统提示词，根据代码类型
      const systemPrompt = this.buildSystemPrompt(codeGenType);
      
      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      });

      const generatedCode = response.choices[0]?.message?.content || '';
      
      if (!generatedCode) {
        throw new Error('AI服务返回空内容');
      }

      this.logger.log(`AI代码生成成功，生成内容长度: ${generatedCode.length}`);
      return generatedCode;
      
    } catch (error) {
      this.logger.error(`AI同步请求失败: ${error.message}`, error.stack);
      
      // 如果是API Key错误，返回友好的错误提示
      if (error.message.includes('Incorrect API key')) {
        this.logger.error('🔑 请检查您的OpenAI API Key是否正确配置');
        return this.generateFallbackCode(userInput, codeGenType);
      }
      
      throw new Error(`AI代码生成失败: ${error.message}`);
    }
  }

  /**
   * 生成备用代码 - 当API Key未配置时使用
   */
  private generateFallbackCode(userInput: string, codeGenType: string): string {
    this.logger.warn('🔄 使用备用代码生成器');
    
    const timestamp = new Date().toLocaleString('zh-CN');
    
    switch (codeGenType) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI代码生成器 - 演示版本</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        h1 { color: #2c3e50; text-align: center; }
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
        <h1>🤖 AI代码生成器</h1>
        
        <div class="warning">
            <h3>⚠️ 配置提醒</h3>
            <p>当前使用的是演示版本，因为OpenAI API Key未正确配置。</p>
            <p>要使用真实的AI代码生成功能，请：</p>
            <ol>
                <li>在项目根目录的 <code>.env</code> 文件中设置 <code>OPENAI_API_KEY</code></li>
                <li>将值设置为您的真实OpenAI API密钥</li>
                <li>重启应用服务</li>
            </ol>
        </div>
        
        <div class="info">
            <h3>📝 用户需求</h3>
            <p>${userInput.replace(/\n/g, '<br>')}</p>
            <p><strong>生成时间：</strong>${timestamp}</p>
            <p><strong>代码类型：</strong>${codeGenType}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn" onclick="showMessage()">点击测试功能</button>
        </div>
    </div>
    
    <script>
        function showMessage() {
            alert('演示功能正常！配置OpenAI API Key后可使用真实AI代码生成。');
        }
        
        console.log('演示版本已加载，请配置OpenAI API Key以使用完整功能');
    </script>
</body>
</html>`;

      case 'vue':
        return `<template>
  <div class="demo-container">
    <h1>🤖 AI代码生成器 - Vue演示</h1>
    <div class="warning">
      <p>⚠️ 请配置OpenAI API Key以使用真实AI代码生成功能</p>
    </div>
    <div class="info">
      <h3>用户需求：</h3>
      <p>{{ userInput }}</p>
      <p>生成时间：{{ timestamp }}</p>
    </div>
    <button @click="showMessage" class="btn">测试功能</button>
  </div>
</template>

<script>
export default {
  name: 'DemoApp',
  data() {
    return {
      userInput: '${userInput.replace(/'/g, "\\'")}',
      timestamp: '${timestamp}'
    }
  },
  methods: {
    showMessage() {
      alert('Vue演示功能正常！配置OpenAI API Key后可使用真实AI代码生成。');
    }
  }
}
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}
.info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}
.btn {
  background: #42b883;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
</style>`;

      default:
        return `/* AI代码生成器 - 演示版本 */
/* 用户需求: ${userInput} */
/* 生成时间: ${timestamp} */
/* 代码类型: ${codeGenType} */

// ⚠️ 请配置OpenAI API Key以使用真实AI代码生成功能
console.log('演示版本已加载，请配置OpenAI API Key以使用完整功能');`;
    }
  }

  /**
   * 构建系统提示词 - 根据代码生成类型
   */
  private buildSystemPrompt(codeGenType: string): string {
    const basePrompt = `你是一个专业的全栈开发工程师，擅长根据用户需求生成高质量的代码。

请严格按照以下要求生成代码：
1. 代码必须完整可运行，不能有任何占位符或TODO
2. 代码风格要现代化、专业化
3. 必须包含完整的功能实现
4. 代码要有良好的注释和结构
5. 样式要美观、响应式设计
6. 只返回代码内容，不要包含任何解释文字`;

    switch (codeGenType) {
      case 'html':
        return `${basePrompt}

生成要求：
- 生成完整的HTML文件，包含HTML、CSS、JavaScript
- 使用现代化的CSS样式，支持响应式设计
- JavaScript功能要完整可用
- 整个文件要自包含，不依赖外部资源
- 代码要优雅、可维护`;

      case 'vue':
        return `${basePrompt}

生成要求：
- 生成Vue 3组件代码
- 使用Composition API
- 包含完整的template、script、style
- 样式使用scoped
- 功能要完整实现`;

      case 'react':
        return `${basePrompt}

生成要求：
- 生成React函数组件
- 使用现代React Hooks
- 包含完整的JSX和样式
- 功能要完整实现`;

      default:
        return `${basePrompt}

生成完整可运行的${codeGenType}代码。`;
    }
  }

  /**
   * 生成代码 - 兼容旧接口
   */
  async generateCode(prompt: string, codeGenType: string): Promise<string> {
    return this.doSyncStableRequest(prompt, codeGenType);
  }

  /**
   * 生成HTML代码
   */
  private generateHtmlCode(prompt: string): string {
    // 这里应该调用真正的AI API，现在先用模板生成
    const timestamp = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的应用</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            max-width: 800px;
            width: 100%;
            text-align: center;
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2.5em;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .prompt-display {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
            text-align: left;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .interactive-demo {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
            border-radius: 15px;
            color: white;
        }
        
        .timestamp {
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI生成的智能应用</h1>
        
        <div class="prompt-display">
            <h3>📝 您的需求</h3>
            <p><strong>${prompt}</strong></p>
        </div>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h3>🎨 智能设计</h3>
                <p>基于您的需求自动生成美观的界面设计</p>
            </div>
            <div class="feature-card">
                <h3>⚡ 快速响应</h3>
                <p>优化的代码结构确保应用快速加载</p>
            </div>
            <div class="feature-card">
                <h3>📱 响应式布局</h3>
                <p>自适应各种设备屏幕尺寸</p>
            </div>
        </div>
        
        <div class="interactive-demo">
            <h3>🎯 功能演示</h3>
            <p>根据您的需求"${prompt}"，我们为您生成了这个交互式应用</p>
            <button class="btn" onclick="showDemo()">体验功能</button>
            <button class="btn" onclick="showInfo()">查看详情</button>
        </div>
        
        <div class="timestamp">
            生成时间: ${timestamp}
        </div>
    </div>
    
    <script>
        function showDemo() {
            alert('🎉 功能演示：\\n\\n根据您的需求"${prompt}"，这个应用具备以下特性：\\n\\n✅ 智能化界面\\n✅ 响应式设计\\n✅ 交互式体验\\n✅ 现代化样式');
        }
        
        function showInfo() {
            const info = \`
📊 应用信息：
🔹 生成时间: ${timestamp}
🔹 用户需求: ${prompt}
🔹 技术栈: HTML5 + CSS3 + JavaScript
🔹 特性: 响应式设计、现代化UI、交互体验
            \`;
            alert(info);
        }
        
        // 页面加载动画
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.container');
            container.style.opacity = '0';
            container.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.8s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
            
            console.log('🚀 AI生成的应用已加载完成！');
            console.log('用户需求:', '${prompt}');
        });
        
        // 添加一些交互效果
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', function() {
                this.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                this.style.color = 'white';
                setTimeout(() => {
                    this.style.background = 'white';
                    this.style.color = 'black';
                }, 1000);
            });
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成Vue代码
   */
  private generateVueCode(prompt: string): string {
    return `<template>
  <div class="vue-app">
    <h1>Vue应用 - {{ title }}</h1>
    <div class="prompt-section">
      <h3>用户需求</h3>
      <p>{{ userPrompt }}</p>
    </div>
    <button @click="handleClick" class="btn">点击体验</button>
  </div>
</template>

<script>
export default {
  name: 'GeneratedApp',
  data() {
    return {
      title: 'AI生成的Vue应用',
      userPrompt: '${prompt}',
      clickCount: 0
    }
  },
  methods: {
    handleClick() {
      this.clickCount++;
      alert(\`功能演示 - 点击次数: \${this.clickCount}\`);
    }
  }
}
</script>

<style scoped>
.vue-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.btn {
  background: #42b883;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>`;
  }

  /**
   * 生成React代码
   */
  private generateReactCode(prompt: string): string {
    return `import React, { useState } from 'react';

function GeneratedApp() {
  const [clickCount, setClickCount] = useState(0);
  
  const handleClick = () => {
    setClickCount(prev => prev + 1);
    alert(\`React功能演示 - 点击次数: \${clickCount + 1}\`);
  };
  
  return (
    <div className="react-app">
      <h1>React应用 - AI生成</h1>
      <div className="prompt-section">
        <h3>用户需求</h3>
        <p>${prompt}</p>
      </div>
      <button onClick={handleClick} className="btn">
        点击体验 ({clickCount})
      </button>
    </div>
  );
}

export default GeneratedApp;`;
  }
}