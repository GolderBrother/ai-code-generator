import { Injectable } from '@nestjs/common';

export interface ScreenshotOptions {
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  quality?: number;
}

export interface ScreenshotResult {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;
  error?: string;
}

@Injectable()
export class ScreenshotService {
  /**
   * 生成网页截图
   */
  async captureScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    try {
      // 这里使用模拟实现，实际项目中可以使用 puppeteer 或其他截图工具
      console.log('正在生成截图:', options);
      
      // 模拟截图生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const timestamp = Date.now();
      const imagePath = `/screenshots/screenshot_${timestamp}.png`;
      
      return {
        success: true,
        imagePath,
        imageUrl: `http://localhost:3000${imagePath}`,
      };
    } catch (error) {
      console.error('截图生成失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 批量生成截图
   */
  async captureMultipleScreenshots(optionsList: ScreenshotOptions[]): Promise<ScreenshotResult[]> {
    const results: ScreenshotResult[] = [];
    
    for (const options of optionsList) {
      const result = await this.captureScreenshot(options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 生成移动端截图
   */
  async captureMobileScreenshot(url: string): Promise<ScreenshotResult> {
    return this.captureScreenshot({
      url,
      width: 375,
      height: 667,
      fullPage: true,
    });
  }

  /**
   * 生成桌面端截图
   */
  async captureDesktopScreenshot(url: string): Promise<ScreenshotResult> {
    return this.captureScreenshot({
      url,
      width: 1920,
      height: 1080,
      fullPage: false,
    });
  }
}