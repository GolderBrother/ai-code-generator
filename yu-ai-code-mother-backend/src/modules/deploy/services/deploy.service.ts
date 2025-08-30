import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployRecord } from '../entities/deploy-record.entity';
import { DeployAppDto } from '../dto/deploy-app.dto';
import { AppsService } from '../../apps/apps.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 部署服务
 * 对齐Java版本的部署功能
 */
@Injectable()
export class DeployService {
  private readonly deployBasePath = process.env.DEPLOY_BASE_PATH || './deploy';
  private readonly previewBaseUrl = process.env.PREVIEW_BASE_URL || 'http://localhost:3001';

  constructor(
    @InjectRepository(DeployRecord)
    private readonly deployRepository: Repository<DeployRecord>,
    private readonly appsService: AppsService,
  ) {
    // 确保部署目录存在
    fs.ensureDirSync(this.deployBasePath);
  }

  /**
   * 部署应用
   */
  async deployApp(deployDto: DeployAppDto, userId: number): Promise<DeployRecord> {
    // 获取应用信息
    const app = await this.appsService.findById(deployDto.appId);
    if (!app) {
      throw new NotFoundException('应用不存在');
    }

    // 创建部署记录
    const deployRecord = this.deployRepository.create({
      appId: deployDto.appId,
      userId,
      deployStatus: 0, // 部署中
      deployLog: '开始部署...\n',
    });

    const savedRecord = await this.deployRepository.save(deployRecord);

    // 异步执行部署
    this.executeDeployment(savedRecord, app).catch(error => {
      console.error('部署失败:', error);
      this.updateDeployStatus(savedRecord.id, 2, `部署失败: ${error.message}`);
    });

    return savedRecord;
  }

  /**
   * 执行部署
   */
  private async executeDeployment(deployRecord: DeployRecord, app: any): Promise<void> {
    try {
      const deployId = deployRecord.id;
      const deployPath = path.join(this.deployBasePath, `app_${app.id}_${deployId}`);
      
      // 更新部署路径
      await this.deployRepository.update(deployId, { deployPath });

      // 创建部署目录
      await fs.ensureDir(deployPath);
      
      let deployLog = deployRecord.deployLog || '';
      deployLog += '创建部署目录...\n';

      // 根据应用类型生成文件
      if (app.type === 'html') {
        await this.deployHtmlApp(deployPath, app, deployLog);
      } else if (app.type === 'vue') {
        await this.deployVueApp(deployPath, app, deployLog);
      } else if (app.type === 'react') {
        await this.deployReactApp(deployPath, app, deployLog);
      } else {
        throw new Error(`不支持的应用类型: ${app.type}`);
      }

      // 生成预览URL
      const previewUrl = `${this.previewBaseUrl}/preview/${deployId}`;
      
      // 更新部署状态为成功
      await this.deployRepository.update(deployId, {
        deployStatus: 1,
        deployLog: deployLog + '部署成功！\n',
        previewUrl,
        deployUrl: previewUrl,
      });

    } catch (error) {
      await this.updateDeployStatus(deployRecord.id, 2, `部署失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 部署HTML应用
   */
  private async deployHtmlApp(deployPath: string, app: any, deployLog: string): Promise<void> {
    deployLog += '生成HTML文件...\n';
    
    const htmlContent = app.generatedCode || app.code || '<h1>Hello World</h1>';
    const indexPath = path.join(deployPath, 'index.html');
    
    await fs.writeFile(indexPath, htmlContent, 'utf8');
    deployLog += 'HTML文件生成完成\n';
  }

  /**
   * 部署Vue应用
   */
  private async deployVueApp(deployPath: string, app: any, deployLog: string): Promise<void> {
    deployLog += '生成Vue应用...\n';
    
    // 创建基础Vue项目结构
    const packageJson = {
      name: `vue-app-${app.id}`,
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.3.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.0.0',
        vite: '^4.0.0'
      }
    };

    await fs.writeFile(
      path.join(deployPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // 创建vite配置
    const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/preview/${app.id}/'
})
`;
    await fs.writeFile(path.join(deployPath, 'vite.config.js'), viteConfig);

    // 创建index.html
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app.name || 'Vue App'}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
    await fs.writeFile(path.join(deployPath, 'index.html'), indexHtml);

    // 创建src目录和文件
    const srcPath = path.join(deployPath, 'src');
    await fs.ensureDir(srcPath);

    const mainJs = `
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;
    await fs.writeFile(path.join(srcPath, 'main.js'), mainJs);

    const appVue = app.generatedCode || app.code || `
<template>
  <div>
    <h1>Hello Vue!</h1>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
`;
    await fs.writeFile(path.join(srcPath, 'App.vue'), appVue);

    deployLog += 'Vue应用结构生成完成\n';
  }

  /**
   * 部署React应用
   */
  private async deployReactApp(deployPath: string, app: any, deployLog: string): Promise<void> {
    deployLog += '生成React应用...\n';
    
    // 创建基础React项目结构
    const packageJson = {
      name: `react-app-${app.id}`,
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        '@vitejs/plugin-react': '^4.0.0',
        vite: '^4.0.0'
      }
    };

    await fs.writeFile(
      path.join(deployPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // 创建vite配置
    const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/preview/${app.id}/'
})
`;
    await fs.writeFile(path.join(deployPath, 'vite.config.js'), viteConfig);

    // 创建index.html
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app.name || 'React App'}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
    await fs.writeFile(path.join(deployPath, 'index.html'), indexHtml);

    // 创建src目录和文件
    const srcPath = path.join(deployPath, 'src');
    await fs.ensureDir(srcPath);

    const mainJsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
    await fs.writeFile(path.join(srcPath, 'main.jsx'), mainJsx);

    const appJsx = app.generatedCode || app.code || `
import React from 'react'

function App() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  )
}

export default App
`;
    await fs.writeFile(path.join(srcPath, 'App.jsx'), appJsx);

    deployLog += 'React应用结构生成完成\n';
  }

  /**
   * 更新部署状态
   */
  private async updateDeployStatus(deployId: number, status: number, log: string): Promise<void> {
    await this.deployRepository.update(deployId, {
      deployStatus: status,
      deployLog: log,
    });
  }

  /**
   * 获取部署记录
   */
  async getDeployRecord(deployId: number): Promise<DeployRecord> {
    const record = await this.deployRepository.findOne({
      where: { id: deployId, isDelete: 0 },
    });

    if (!record) {
      throw new NotFoundException('部署记录不存在');
    }

    return record;
  }

  /**
   * 获取用户的部署记录列表
   */
  async getUserDeployRecords(userId: number): Promise<DeployRecord[]> {
    return await this.deployRepository.find({
      where: { userId, isDelete: 0 },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 删除部署
   */
  async deleteDeployment(deployId: number, userId: number): Promise<void> {
    const record = await this.getDeployRecord(deployId);
    
    if (record.userId !== userId) {
      throw new BadRequestException('无权限删除此部署');
    }

    // 软删除
    await this.deployRepository.update(deployId, { isDelete: 1 });

    // 删除部署文件
    if (record.deployPath && await fs.pathExists(record.deployPath)) {
      await fs.remove(record.deployPath);
    }
  }
}