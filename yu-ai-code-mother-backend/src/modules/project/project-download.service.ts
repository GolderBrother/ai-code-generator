import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

export interface ProjectFile {
  path: string;
  content: string;
}

export interface ProjectDownloadResult {
  success: boolean;
  downloadUrl?: string;
  filePath?: string;
  error?: string;
}

@Injectable()
export class ProjectDownloadService {
  private readonly downloadDir = path.join(process.cwd(), 'downloads');

  constructor() {
    // 确保下载目录存在
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  /**
   * 创建项目下载包
   */
  async createProjectDownload(
    projectName: string,
    files: ProjectFile[],
  ): Promise<ProjectDownloadResult> {
    try {
      const timestamp = Date.now();
      const projectDir = path.join(this.downloadDir, `${projectName}_${timestamp}`);
      const zipPath = `${projectDir}.zip`;

      // 创建项目目录
      fs.mkdirSync(projectDir, { recursive: true });

      // 写入所有文件
      for (const file of files) {
        const filePath = path.join(projectDir, file.path);
        const fileDir = path.dirname(filePath);
        
        // 确保文件目录存在
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, file.content, 'utf8');
      }

      // 创建ZIP文件
      await this.createZipFile(projectDir, zipPath);

      // 清理临时目录
      this.cleanupDirectory(projectDir);

      return {
        success: true,
        downloadUrl: `/downloads/${path.basename(zipPath)}`,
        filePath: zipPath,
      };
    } catch (error) {
      console.error('创建项目下载包失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 创建ZIP文件
   */
  private async createZipFile(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`ZIP文件创建完成: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * 清理目录
   */
  private cleanupDirectory(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('清理目录失败:', error);
    }
  }

  /**
   * 清理过期的下载文件
   */
  cleanupExpiredDownloads(maxAgeHours: number = 24): void {
    try {
      const files = fs.readdirSync(this.downloadDir);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // 转换为毫秒
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.downloadDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`清理过期文件: ${file}`);
        }
      }
    } catch (error) {
      console.error('清理过期下载文件失败:', error);
    }
  }

  /**
   * 获取下载文件信息
   */
  getDownloadInfo(fileName: string): { exists: boolean; filePath?: string; size?: number } {
    const filePath = path.join(this.downloadDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filePath);
    return {
      exists: true,
      filePath,
      size: stats.size,
    };
  }
}