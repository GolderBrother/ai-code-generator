import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 截图服务 - 对应Java版本的ScreenshotService
 */
@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  
  // 截图保存目录
  private readonly SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || path.join(process.cwd(), 'screenshots');
  
  constructor() {
    // 确保截图目录存在
    if (!fs.existsSync(this.SCREENSHOT_DIR)) {
      fs.mkdirSync(this.SCREENSHOT_DIR, { recursive: true });
    }
  }

  /**
   * 生成并上传截图
   * @param appUrl 应用访问URL
   * @returns 截图URL
   */
  async generateAndUploadScreenshot(appUrl: string): Promise<string> {
    try {
      this.logger.log(`开始为应用生成截图: ${appUrl}`);
      
      // 生成截图文件名
      const timestamp = Date.now();
      const filename = `app_screenshot_${timestamp}.png`;
      const screenshotPath = path.join(this.SCREENSHOT_DIR, filename);
      
      // 使用Puppeteer生成截图
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      
      const page = await browser.newPage();
      
      // 设置视口大小
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });
      
      // 设置超时时间
      page.setDefaultTimeout(30000);
      
      try {
        // 访问应用URL
        await page.goto(appUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        
        // 等待页面完全加载
        await page.waitForTimeout(2000);
        
        // 生成截图
        await page.screenshot({
          path: screenshotPath,
          fullPage: false, // 只截取视口内容
          type: 'png',
        });
        
        this.logger.log(`截图已保存到: ${screenshotPath}`);
        
      } catch (error) {
        this.logger.error(`访问应用URL失败: ${error.message}`);
        // 如果访问失败，生成一个默认截图
        await this.generateDefaultScreenshot(screenshotPath, appUrl);
      } finally {
        await browser.close();
      }
      
      // 返回截图的访问URL
      const screenshotUrl = `${process.env.DEPLOY_HOST || 'http://localhost:3000'}/api/static/screenshots/${filename}`;
      
      this.logger.log(`截图生成完成: ${screenshotUrl}`);
      return screenshotUrl;
      
    } catch (error) {
      this.logger.error(`生成截图失败: ${error.message}`, error.stack);
      // 返回默认截图URL
      return `${process.env.DEPLOY_HOST || 'http://localhost:3000'}/api/static/screenshots/default.png`;
    }
  }

  /**
   * 生成默认截图（当应用访问失败时）
   */
  private async generateDefaultScreenshot(screenshotPath: string, appUrl: string): Promise<void> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      // 生成一个包含错误信息的HTML页面
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>应用预览</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 10px;
              backdrop-filter: blur(10px);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .url {
              font-size: 14px;
              opacity: 0.8;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🚀</div>
            <div class="title">应用部署成功</div>
            <div class="url">${appUrl}</div>
          </div>
        </body>
        </html>
      `;
      
      await page.setContent(errorHtml);
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: screenshotPath,
        type: 'png',
      });
      
      await browser.close();
      
      this.logger.log(`默认截图已生成: ${screenshotPath}`);
      
    } catch (error) {
      this.logger.error(`生成默认截图失败: ${error.message}`);
    }
  }

  /**
   * 批量生成截图
   */
  async batchGenerateScreenshots(appUrls: string[]): Promise<string[]> {
    const results: string[] = [];
    
    for (const appUrl of appUrls) {
      try {
        const screenshotUrl = await this.generateAndUploadScreenshot(appUrl);
        results.push(screenshotUrl);
      } catch (error) {
        this.logger.error(`批量生成截图失败 - URL: ${appUrl}, 错误: ${error.message}`);
        results.push('');
      }
    }
    
    return results;
  }

  /**
   * 清理过期截图
   */
  async cleanupOldScreenshots(daysOld: number = 30): Promise<void> {
    try {
      const files = fs.readdirSync(this.SCREENSHOT_DIR);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.SCREENSHOT_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
      
      this.logger.log(`清理完成，删除了 ${deletedCount} 个过期截图文件`);
      
    } catch (error) {
      this.logger.error(`清理截图文件失败: ${error.message}`);
    }
  }
}