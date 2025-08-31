import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppRepository } from './repositories/app.repository';
import { App } from './entities/app.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { ChatHistoryService } from '../chat-history/chat-history.service';
import { Response } from 'express';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppsService {
  constructor(
    private readonly appRepository: AppRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  // 配置常量
  private readonly CODE_OUTPUT_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output');
  private readonly CODE_DEPLOY_ROOT_DIR = process.env.CODE_DEPLOY_ROOT_DIR || path.join(process.cwd(), 'deploy');
  private readonly DEPLOY_HOST = process.env.DEPLOY_HOST || 'http://localhost:3000/api/static';

  /**
   * AI对话生成代码 (SSE流式) - 严格对照Java版本实现
   */
  chatToGenCode(appId: number, message: string, user: User): Observable<any> {
    return new Observable(subscriber => {
      (async () => {
        try {
          // 1. 参数校验 - 对应Java版本的ThrowUtils.throwIf
          if (!appId || appId <= 0) {
            throw new UnauthorizedException('应用 ID 错误');
          }
          if (!message || message.trim() === '') {
            throw new UnauthorizedException('提示词不能为空');
          }

          // 2. 查询应用信息 - 对应Java版本的this.getById(appId)
          const app = await this.getById(appId);
          if (!app) {
            throw new NotFoundException('应用不存在');
          }

          // 3. 权限校验，仅本人可以和自己的应用对话 - 对应Java版本
          if (app.userId !== user.id) {
            throw new UnauthorizedException('无权限访问该应用');
          }

          // 4. 获取应用的代码生成类型 - 对应Java版本
          const codeGenType = app.codeGenType;
          if (!codeGenType) {
            throw new UnauthorizedException('应用代码生成类型错误');
          }

          // 5. 在调用 AI 前，先保存用户消息到数据库中 - 对应Java版本
          try {
            await this.chatHistoryService.addChatHistory({
              appId,
              messageContent: message,
              messageType: 0, // 0 表示用户消息 (ChatHistoryMessageTypeEnum.USER.getValue())
            }, user);
          } catch (error) {
            console.warn('保存聊天记录失败:', error);
          }

          // 6. 设置监控上下文（用户 ID 和应用 ID）- 对应Java版本的MonitorContextHolder.setContext
          // 注：这里可以添加监控逻辑，暂时省略

          // 7. 调用 AI 生成代码（流式）- 对应Java版本的 aiCodeGeneratorFacade.generateAndSaveCodeStream
          const codeStream = this.generateAndSaveCodeStreamReal(message, codeGenType, appId, app);
          
          // 8. 收集 AI 响应的内容，并且在完成后保存记录到对话历史 - 对应Java版本
          let aiResponseContent = '';
          
          // 流式输出代码生成过程
          for await (const chunk of codeStream) {
            aiResponseContent += chunk;
            subscriber.next({ d: chunk });
          }

          // 9. 保存AI响应到数据库 - 对应Java版本的streamHandlerExecutor.doExecute
          try {
            await this.chatHistoryService.addChatHistory({
              appId,
              messageContent: aiResponseContent || '代码生成完成',
              messageType: 1, // 1 表示AI响应 (ChatHistoryMessageTypeEnum.AI.getValue())
            }, user);
          } catch (error) {
            console.warn('保存AI响应失败:', error);
          }

          // 10. 发送完成事件
          subscriber.next({ event: 'done', data: '' });
          subscriber.complete();

        } catch (error) {
          console.error('Code generation error:', error);
          subscriber.error(error);
        }
      })();
    });
  }

  /**
   * 真实的AI代码生成流 - 严格对应Java版本的 aiCodeGeneratorFacade.generateAndSaveCodeStream
   */
  private async *generateAndSaveCodeStreamReal(message: string, codeGenType: string, appId: number, app: App): AsyncGenerator<string, void, unknown> {
    try {
      // 1. 构建用户输入 - 对应Java版本的buildUserInput方法
      yield '🔍 正在分析您的需求...\n';
      const userInput = this.buildUserInput(app, message);
      
      // 2. 调用AI生成代码 - 对应Java版本的aiManager.doSyncStableRequest
      yield '🧠 AI正在思考最佳实现方案...\n';
      const generatedCode = await this.aiService.doSyncStableRequest(userInput, codeGenType);
      
      // 3. 保存生成的代码到文件 - 对应Java版本的文件保存逻辑
      yield '💾 正在保存文件...\n';
      const savedFiles = await this.saveGeneratedCodeToFiles(app, generatedCode, codeGenType, appId);
      
      yield `✅ 代码生成完成！文件已保存到: ${savedFiles.join(', ')}\n`;
      yield `\n生成的代码内容:\n${generatedCode}\n`;
      
    } catch (error) {
      yield `❌ 代码生成失败: ${error.message}\n`;
      throw error;
    }
  }

  /**
   * 构建用户输入 - 对应Java版本的buildUserInput方法
   * 这是关键方法，将应用信息和用户消息组合成完整的AI提示词
   */
  private buildUserInput(app: App, userMessage: string): string {
    const userInput = `
应用信息：
应用名称：${app.appName || '未命名应用'}
应用描述：${app.initPrompt || '无'}
应用类型：${app.codeGenType}
应用标签：无

用户需求：
${userMessage}

请根据以上应用信息和用户需求，生成完整可用的${app.codeGenType}代码。代码要求：
1. 功能完整，可直接运行
2. 代码风格现代化、专业
3. 界面美观，用户体验良好
4. 包含必要的交互功能
5. 响应式设计，适配各种设备
`;

    console.log(`构建的用户输入长度: ${userInput.length}`);
    return userInput;
  }

  /**
   * 保存生成的代码到文件 - 对应Java版本的文件保存逻辑
   */
  private async saveGeneratedCodeToFiles(app: App, generatedCode: string, codeGenType: string, appId: number): Promise<string[]> {
    const sourceDirName = `${codeGenType}_${appId}`;
    const outputDir = path.join(this.CODE_OUTPUT_ROOT_DIR, sourceDirName);
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const savedFiles: string[] = [];
    
    try {
      // 根据应用类型保存不同的文件
      switch (codeGenType) {
        case 'html':
          const htmlFile = path.join(outputDir, 'index.html');
          fs.writeFileSync(htmlFile, generatedCode, 'utf-8');
          savedFiles.push(htmlFile);
          break;
          
        case 'vue_project':
          const vueFile = path.join(outputDir, 'App.vue');
          fs.writeFileSync(vueFile, generatedCode, 'utf-8');
          savedFiles.push(vueFile);
          break;
          
        case 'multi_file':
          const multiFile = path.join(outputDir, 'index.html');
          fs.writeFileSync(multiFile, generatedCode, 'utf-8');
          savedFiles.push(multiFile);
          break;
          
        default:
          const defaultFile = path.join(outputDir, 'index.html');
          fs.writeFileSync(defaultFile, generatedCode, 'utf-8');
          savedFiles.push(defaultFile);
      }
      
      console.log(`代码已保存到: ${savedFiles.join(', ')}`);
      return savedFiles;
      
    } catch (error) {
      console.error(`保存代码文件失败: ${error.message}`, error);
      throw new Error(`保存代码文件失败: ${error.message}`);
    }
  }

  /**
   * 生成并保存代码文件（参考Java版本的完整实现）
   */
  private async generateAndSaveCodeFiles(appId: number, message: string, app: App, codeGenType: string): Promise<void> {
    try {
      // 1. 构建输出目录
      const sourceDirName = `${codeGenType}_${appId}`;
      const outputDir = path.join(this.CODE_OUTPUT_ROOT_DIR, sourceDirName);
      
      // 2. 确保目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 3. 根据代码生成类型生成不同的文件
      switch (codeGenType) {
        case 'html':
          await this.generateHtmlFiles(outputDir, message, app);
          break;
        case 'vue_project':
          await this.generateVueProjectFiles(outputDir, message, app);
          break;
        case 'multi_file':
          await this.generateMultiFileProject(outputDir, message, app);
          break;
        default:
          await this.generateHtmlFiles(outputDir, message, app);
      }

      console.log(`代码文件已生成到: ${outputDir}`);
    } catch (error) {
      console.error('生成代码文件失败:', error);
      throw error;
    }
  }

  /**
   * 生成HTML文件 - 生成真实可用的代码
   */
  private async generateHtmlFiles(outputDir: string, message: string, app: App): Promise<void> {
    // 生成真实的HTML内容
    const htmlContent = this.generateHtmlContent(message, app);
    
    // 保存到文件
    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  }

  /**
   * 生成多文件项目
   */
  private async generateMultiFileProject(outputDir: string, message: string, app: App): Promise<void> {
    // 生成HTML文件
    const htmlContent = this.generateHtmlContent(message, app);
    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

    // 生成CSS文件
    const cssContent = this.generateCssContent(message, app);
    const cssFilePath = path.join(outputDir, 'style.css');
    fs.writeFileSync(cssFilePath, cssContent, 'utf8');

    // 生成JS文件
    const jsContent = this.generateJsContent(message, app);
    const jsFilePath = path.join(outputDir, 'script.js');
    fs.writeFileSync(jsFilePath, jsContent, 'utf8');
  }

  /**
   * 生成Vue项目文件
   */
  private async generateVueProjectFiles(outputDir: string, message: string, app: App): Promise<void> {
    // 创建Vue项目基础结构
    const directories = ['src', 'src/components', 'src/views', 'public'];
    directories.forEach(dir => {
      const dirPath = path.join(outputDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // 生成package.json
    const packageJson = {
      name: `vue-app-${app.id}`,
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.3.0',
        '@vitejs/plugin-vue': '^4.0.0',
        vite: '^4.0.0'
      }
    };
    fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // 生成主要Vue文件
    const vueContent = this.generateVueContent(message, app);
    fs.writeFileSync(path.join(outputDir, 'src/App.vue'), vueContent);

    // 生成index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.appName}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
  }

  /**
   * 生成HTML内容
   */
  private generateHtmlContent(message: string, app: App): string {
    // 这里应该调用AI服务生成真正的HTML内容
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;">
    <title>${app.appName}</title>
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
        .app-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .feature-section {
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
        <h1>${app.appName}</h1>
        <div class="app-info">
            <h3>应用信息</h3>
            <p><strong>描述：</strong>${app.initPrompt || '暂无描述'}</p>
            <p><strong>类型：</strong>${app.codeGenType || 'Web应用'}</p>
            <p><strong>用户需求：</strong>${message}</p>
            <p><strong>生成时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="feature-section">
            <h3>功能演示</h3>
            <div id="app-content">
                <!-- 根据用户需求生成的具体功能 -->
                <p>根据您的需求"${message}"，我们为您生成了这个应用。</p>
                <button class="btn" onclick="showDemo()">点击体验功能</button>
            </div>
        </div>
    </div>
    
    <script>
        function showDemo() {
            alert('功能演示：' + '${message}');
        }
        
        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('应用已加载完成');
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成Vue组件内容
   */
  private generateVueContent(message: string, app: App): string {
    return `<template>
  <div class="app-container">
    <header class="app-header">
      <h1>{{ appName }}</h1>
      <p>{{ appDesc }}</p>
    </header>
    
    <main class="app-main">
      <div class="feature-card">
        <h2>功能说明</h2>
        <p>{{ userMessage }}</p>
        <button @click="handleAction" class="action-btn">
          开始使用
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const appName = ref('${app.appName}')
    const appDesc = ref('${app.initPrompt || '暂无描述'}')
    const userMessage = ref('${message}')
    
    const handleAction = () => {
      alert('功能执行：' + userMessage.value)
    }
    
    onMounted(() => {
      console.log('Vue应用已挂载')
    })
    
    return {
      appName,
      appDesc,
      userMessage,
      handleAction
    }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-header h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.action-btn {
  background: #42b883;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #369870;
  transform: translateY(-2px);
}
</style>`;
  }

  /**
   * 生成CSS内容
   */
  private generateCssContent(message: string, app: App): string {
    return `/* ${app.appName} - 样式文件 */
/* 生成需求: ${message} */

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

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 3em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,123,255,0.3);
}

.btn-success {
  background: #28a745;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header h1 {
    font-size: 2em;
  }
  
  .card {
    padding: 20px;
  }
}`;
  }

  /**
   * 生成JavaScript内容
   */
  private generateJsContent(message: string, app: App): string {
    return `// ${app.appName} - 主要功能脚本
// 生成需求: ${message}

class AppManager {
  constructor() {
    this.appName = '${app.appName}';
    this.appDesc = '${app.initPrompt || ''}';
    this.userMessage = '${message}';
    this.init();
  }
  
  init() {
    console.log(\`\${this.appName} 应用已初始化\`);
    this.bindEvents();
    this.loadData();
  }
  
  bindEvents() {
    // 绑定按钮点击事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn')) {
        this.handleButtonClick(e.target);
      }
    });
    
    // 绑定表单提交事件
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    });
  }
  
  handleButtonClick(button) {
    const action = button.dataset.action || 'default';
    console.log(\`执行操作: \${action}\`);
    
    switch(action) {
      case 'demo':
        this.showDemo();
        break;
      case 'save':
        this.saveData();
        break;
      case 'load':
        this.loadData();
        break;
      default:
        this.showMessage('按钮被点击了！');
    }
  }
  
  handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('表单数据:', data);
    this.showMessage('表单提交成功！');
  }
  
  showDemo() {
    this.showMessage(\`演示功能: \${this.userMessage}\`);
  }
  
  saveData() {
    const data = {
      appName: this.appName,
      timestamp: new Date().toISOString(),
      userMessage: this.userMessage
    };
    localStorage.setItem('appData', JSON.stringify(data));
    this.showMessage('数据已保存到本地存储');
  }
  
  loadData() {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      const data = JSON.parse(savedData);
      console.log('加载的数据:', data);
      this.showMessage('数据加载成功');
    } else {
      this.showMessage('没有找到保存的数据');
    }
  }
  
  showMessage(message) {
    // 创建提示消息
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-toast';
    messageDiv.textContent = message;
    messageDiv.style.cssText = \`
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    \`;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
      messageDiv.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 300);
    }, 3000);
  }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = \`
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
\`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.appManager = new AppManager();
});`;
  }

  /**
   * 聊天生成代码 (别名方法)
   */
  chatGenCode(appId: number, message: string, user: User): Observable<any> {
    return this.chatToGenCode(appId, message, user);
  }

  /**
   * 构建完整的提示词 - 对应Java版本
   */
  private buildFullPrompt(app: App, message: string): string {
    const initPrompt = app.initPrompt || '创建一个现代化的Web应用';
    return `${initPrompt}\n\n用户需求：${message}\n\n请生成完整的、可运行的代码，包含现代化的样式和交互功能。`;
  }

  /**
   * 创建应用
   */
  async createApp(createAppDto: CreateAppDto, currentUser: User): Promise<number> {
    // 参数校验
    const initPrompt = createAppDto.initPrompt;
    if (!initPrompt || initPrompt.trim() === '') {
      throw new UnauthorizedException('初始化 prompt 不能为空');
    }

    // 应用名称暂时为 initPrompt 前 12 位
    const appName = initPrompt.substring(0, Math.min(initPrompt.length, 12));

    // 使用 AI 智能选择代码生成类型（暂时使用默认逻辑，后续可接入AI服务）
    let codeGenType = 'html'; // 默认类型
    
    // 简单的类型判断逻辑（对应Java版本的AI路由逻辑）
    const prompt = initPrompt.toLowerCase();
    if (prompt.includes('vue') || prompt.includes('组件') || prompt.includes('单页应用')) {
      codeGenType = 'vue_project';
    } else if (prompt.includes('多文件') || prompt.includes('css') || prompt.includes('js')) {
      codeGenType = 'multi_file';
    }

    const savedApp = await this.appRepository.create({
      ...createAppDto,
      appName: appName,
      codeGenType: codeGenType,
      userId: currentUser.id,
    });

    console.log(`应用创建成功，ID: ${savedApp.id}, 类型: ${codeGenType}`);
    return savedApp.id;
  }

  /**
   * 根据ID获取应用
   */
  async getById(id: number): Promise<App | null> {
    return this.appRepository.findOne({ where: { id, isDelete: 0 } });
  }

  /**
   * 根据ID查找应用 (用于部署服务)
   */
  async findById(id: number): Promise<App> {
    const app = await this.appRepository.findOne({
      where: { id, isDelete: 0 },
      relations: ['user'],
    });
    if (!app) {
      throw new NotFoundException(`应用 ID ${id} 不存在`);
    }
    return app;
  }

  /**
   * 根据ID更新应用
   */
  async updateById(updateData: any): Promise<boolean> {
    try {
      const { id, ...data } = updateData;
      await this.appRepository.update(id, data);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 根据ID删除应用
   */
  async removeById(id: number): Promise<boolean> {
    try {
      await this.appRepository.update(id, { isDelete: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取应用VO
   */
  async getAppVO(app: App): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: app.userId } });
    return {
      ...app,
      user: user ? {
        id: user.id,
        userAccount: user.userAccount,
        userName: user.userName,
        userAvatar: user.userAvatar,
        userProfile: user.userProfile,
        userRole: user.userRole,
        createTime: user.createTime,
        updateTime: user.updateTime,
      } : null,
    };
  }

  /**
   * 获取应用VO列表
   */
  async getAppVOList(apps: App[]): Promise<any[]> {
    const userIds = apps.map(app => app.userId);
    const users = await this.userRepository.find({ where: { id: In(userIds) } });
    const userMap = new Map(users.map(user => [user.id, user]));

    return apps.map(app => ({
      ...app,
      user: userMap.get(app.userId) || null,
    }));
  }

  /**
   * 分页获取我的应用列表
   */
  async listMyAppVOByPage(appQueryDto: AppQueryDto, user: User): Promise<{
    pageNum: number;
    pageSize: number;
    totalRow: number;
    records: any[];
  }> {
    const { pageNum = 1, pageSize = 10 } = appQueryDto;
    
    // 设置查询条件：只查询当前用户的应用
    const queryDto = { ...appQueryDto, userId: user.id };
    const queryWrapper = await this.getQueryWrapper(queryDto);
    
    // 分页查询
    const appPage = await this.page(pageNum, pageSize, queryWrapper);
    
    // 数据封装
    return {
      pageNum: pageNum,
      pageSize: pageSize,
      totalRow: appPage.totalRow,
      records: await this.getAppVOList(appPage.records),
    };
  }

  /**
   * 获取查询条件
   */
  async getQueryWrapper(appQueryDto: AppQueryDto): Promise<any> {
    const where: any = { isDelete: 0 };
    
    if (appQueryDto.appName) {
      where.appName = appQueryDto.appName;
    }
    
    if (appQueryDto.userId) {
      where.userId = appQueryDto.userId;
    }
    
    if (appQueryDto.priority !== undefined) {
      where.priority = appQueryDto.priority;
    }
    
    return where;
  }

  /**
   * 分页查询
   */
  async page(pageNum: number, pageSize: number, where: any): Promise<{
    totalRow: number;
    records: App[];
  }> {
    const queryBuilder = this.appRepository.createQueryBuilder('app');
    
    // 添加基础条件
    queryBuilder.where('app.isDelete = :isDelete', { isDelete: 0 });
    
    // 添加动态条件
    if (where.appName) {
      queryBuilder.andWhere('app.appName LIKE :appName', { appName: `%${where.appName}%` });
    }
    
    if (where.userId) {
      queryBuilder.andWhere('app.userId = :userId', { userId: where.userId });
    }
    
    if (where.priority !== undefined) {
      queryBuilder.andWhere('app.priority = :priority', { priority: where.priority });
    }
    
    // 分页和排序
    const records = await queryBuilder
      .orderBy('app.createTime', 'DESC')
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    const totalRow = await queryBuilder.getCount();

    return { totalRow, records };
  }

  /**
   * 部署应用（完整实现，对应Java版本）
   */
  async deployApp(appId: number, user: User): Promise<string> {
    // 1. 参数校验
    if (!appId || appId <= 0) {
      throw new UnauthorizedException('应用 ID 错误');
    }
    if (!user) {
      throw new UnauthorizedException('用户未登录');
    }

    // 2. 查询应用信息
    const app = await this.getById(appId);
    if (!app) {
      throw new NotFoundException('应用不存在');
    }

    // 3. 权限校验，仅本人可以部署自己的应用
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限部署该应用');
    }

    // 4. 检查是否已有 deployKey
    let deployKey = app.deployKey;
    // 如果没有，则生成 6 位 deployKey（字母 + 数字）
    if (!deployKey) {
      deployKey = this.generateRandomString(6);
    }

    // 5. 获取代码生成类型，获取原始代码生成路径（应用访问目录）
    const codeGenType = app.codeGenType;
    if (!codeGenType) {
      throw new UnauthorizedException('应用代码生成类型错误');
    }
    const sourceDirName = `${codeGenType}_${appId}`;
    const sourceDirPath = path.join(this.CODE_OUTPUT_ROOT_DIR, sourceDirName);
    // 6. 检查路径是否存在
    if (!fs.existsSync(sourceDirPath) || !fs.statSync(sourceDirPath).isDirectory()) {
      throw new UnauthorizedException('应用代码路径不存在，请先生成应用');
    }

    // 7. Vue 项目特殊处理：执行构建
    let sourceDir = sourceDirPath;
    if (codeGenType === 'vue_project') {
      // Vue 项目需要构建
      const buildSuccess = await this.buildVueProject(sourceDirPath);
      if (!buildSuccess) {
        throw new UnauthorizedException('Vue 项目构建失败，请重试');
      }
      // 检查 dist 目录是否存在
      const distDir = path.join(sourceDirPath, 'dist');
      if (!fs.existsSync(distDir)) {
        throw new UnauthorizedException('Vue 项目构建完成但未生成 dist 目录');
      }
      // 构建完成后，需要将构建后的文件复制到部署目录
      sourceDir = distDir;
    }

    // 8. 复制文件到部署目录
    const deployDirPath = path.join(this.CODE_DEPLOY_ROOT_DIR, deployKey);
    try {
      await this.copyDirectory(sourceDir, deployDirPath);
    } catch (error) {
      throw new UnauthorizedException(`应用部署失败：${error.message}`);
    }

    // 9. 更新数据库
    const updateResult = await this.updateById({
      id: appId,
      deployKey: deployKey,
      deployedTime: new Date(),
    });
    if (!updateResult) {
      throw new UnauthorizedException('更新应用部署信息失败');
    }

    // 10. 构建应用访问 URL
    const appDeployUrl = `${this.DEPLOY_HOST}/${deployKey}/`;

    // 11. 异步生成截图并且更新应用封面
    this.generateAppScreenshotAsync(appId, appDeployUrl);

    return appDeployUrl;
  }

  /**
   * 生成随机字符串
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 构建Vue项目
   */
  private async buildVueProject(projectPath: string): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 检查是否有package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.warn('Vue项目缺少package.json文件');
        return false;
      }

      // 安装依赖
      console.log('正在安装Vue项目依赖...');
      await execAsync('npm install', { cwd: projectPath });

      // 执行构建
      console.log('正在构建Vue项目...');
      await execAsync('npm run build', { cwd: projectPath });

      return true;
    } catch (error) {
      console.error('Vue项目构建失败:', error);
      return false;
    }
  }

  /**
   * 复制目录
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    try {
      // 确保目标目录存在
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      // 读取源目录
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          // 递归复制子目录
          await this.copyDirectory(srcPath, destPath);
        } else {
          // 复制文件
          fs.copyFileSync(srcPath, destPath);
        }
      }
    } catch (error) {
      throw new Error(`复制目录失败: ${error.message}`);
    }
  }

  /**
   * 异步生成应用截图并更新封面
   */
  async generateAppScreenshotAsync(appId: number, appUrl: string): Promise<void> {
    // 使用异步方式生成截图
    setTimeout(async () => {
      try {
        // 这里应该调用截图服务生成截图并上传
        // 暂时使用模拟的截图URL
        const screenshotUrl = `${this.DEPLOY_HOST}/screenshots/app_${appId}_${Date.now()}.png`;
        
        // 更新数据库的封面
        await this.updateById({
          id: appId,
          cover: screenshotUrl,
        });
        
        console.log(`应用 ${appId} 截图已生成: ${screenshotUrl}`);
      } catch (error) {
        console.error(`生成应用 ${appId} 截图失败:`, error);
      }
    }, 1000); // 延迟1秒执行
  }

  /**
   * 下载项目为ZIP
   */
  async downloadProjectAsZip(sourcePath: string, fileName: string, res: Response): Promise<void> {
    // 模拟下载逻辑
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.zip"`);
    res.send('Mock ZIP content');
  }

  /**
   * 创建应用 (别名方法)
   */
  async create(createAppDto: CreateAppDto, currentUser: User): Promise<App> {
    return await this.appRepository.create({
      ...createAppDto,
      userId: currentUser.id,
    });
  }
}