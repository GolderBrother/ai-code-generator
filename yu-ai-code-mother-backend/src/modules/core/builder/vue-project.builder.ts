import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Vue 项目构建器
 */
@Injectable()
export class VueProjectBuilder {
  private readonly logger = new Logger(VueProjectBuilder.name);

  /**
   * 构建 Vue 项目
   */
  async buildProject(projectPath: string): Promise<void> {
    try {
      if (!fs.existsSync(projectPath)) {
        throw new Error(`项目路径不存在: ${projectPath}`);
      }

      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        this.logger.warn(`package.json 不存在，跳过构建: ${projectPath}`);
        return;
      }

      this.logger.log(`开始构建 Vue 项目: ${projectPath}`);

      // 检查是否已安装依赖
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        this.logger.log('安装项目依赖...');
        await this.installDependencies(projectPath);
      }

      // 构建项目
      this.logger.log('构建项目...');
      await this.buildVueProject(projectPath);

      this.logger.log(`Vue 项目构建完成: ${projectPath}`);
    } catch (error) {
      this.logger.error(`Vue 项目构建失败: ${error.message}`, error.stack);
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 安装项目依赖
   */
  private async installDependencies(projectPath: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('npm install', {
        cwd: projectPath,
        timeout: 60000, // 60秒超时
      });

      if (stderr && !stderr.includes('WARN')) {
        this.logger.warn(`依赖安装警告: ${stderr}`);
      }

      this.logger.log('依赖安装完成');
    } catch (error) {
      this.logger.error(`依赖安装失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 构建 Vue 项目
   */
  private async buildVueProject(projectPath: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: projectPath,
        timeout: 120000, // 2分钟超时
      });

      if (stderr && !stderr.includes('WARN')) {
        this.logger.warn(`构建警告: ${stderr}`);
      }

      // 检查构建产物
      const distPath = path.join(projectPath, 'dist');
      if (fs.existsSync(distPath)) {
        this.logger.log('构建产物已生成到 dist 目录');
      }

    } catch (error) {
      this.logger.error(`项目构建失败: ${error.message}`);
      // 对于构建失败，我们记录错误但不阻断流程
      // 因为用户仍然可以查看源代码
    }
  }

  /**
   * 检查构建环境
   */
  async checkBuildEnvironment(): Promise<boolean> {
    try {
      // 检查 Node.js
      const { stdout: nodeVersion } = await execAsync('node --version');
      this.logger.log(`Node.js 版本: ${nodeVersion.trim()}`);

      // 检查 npm
      const { stdout: npmVersion } = await execAsync('npm --version');
      this.logger.log(`npm 版本: ${npmVersion.trim()}`);

      return true;
    } catch (error) {
      this.logger.error('构建环境检查失败:', error.message);
      return false;
    }
  }

  /**
   * 清理构建缓存
   */
  async cleanBuildCache(projectPath: string): Promise<void> {
    try {
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      const distPath = path.join(projectPath, 'dist');

      if (fs.existsSync(nodeModulesPath)) {
        await execAsync(`rm -rf ${nodeModulesPath}`);
        this.logger.log('已清理 node_modules');
      }

      if (fs.existsSync(distPath)) {
        await execAsync(`rm -rf ${distPath}`);
        this.logger.log('已清理 dist 目录');
      }
    } catch (error) {
      this.logger.error(`清理构建缓存失败: ${error.message}`);
    }
  }
}