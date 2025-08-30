import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * 工具执行服务
 * 对齐Java版本的工具调用机制
 */
@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);
  private readonly toolsBasePath = process.env.TOOLS_BASE_PATH || './tools';

  constructor() {
    // 确保工具目录存在
    fs.ensureDirSync(this.toolsBasePath);
  }

  /**
   * 执行文件写入工具
   */
  async executeFileWriteTool(params: {
    fileName: string;
    content: string;
    directory?: string;
  }): Promise<{ success: boolean; message: string; filePath?: string }> {
    try {
      const { fileName, content, directory = 'output' } = params;
      
      // 构建文件路径
      const targetDir = path.join(this.toolsBasePath, directory);
      await fs.ensureDir(targetDir);
      
      const filePath = path.join(targetDir, fileName);
      
      // 写入文件
      await fs.writeFile(filePath, content, 'utf8');
      
      this.logger.log(`文件写入成功: ${filePath}`);
      
      return {
        success: true,
        message: '文件写入成功',
        filePath: filePath,
      };
    } catch (error) {
      this.logger.error('文件写入失败:', error);
      return {
        success: false,
        message: `文件写入失败: ${error.message}`,
      };
    }
  }

  /**
   * 通用工具执行器
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    this.logger.log(`执行工具: ${toolName}`, params);
    
    switch (toolName) {
      case 'file_write':
        return await this.executeFileWriteTool(params);
      default:
        return {
          success: false,
          message: `未知的工具类型: ${toolName}`,
        };
    }
  }

  /**
   * 获取可用工具列表
   */
  getAvailableTools(): string[] {
    return ['file_write'];
  }
}