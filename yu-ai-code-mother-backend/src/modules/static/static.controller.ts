import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 静态资源访问控制器
 * 完全对齐 Java 版本的 StaticResourceController 功能
 */
@Controller('static')
export class StaticController {
  // 应用生成根目录（用于浏览）
  private readonly PREVIEW_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output');

  /**
   * 提供静态资源访问，支持目录重定向
   * 访问格式：http://localhost:3000/api/static/{deployKey}[/{fileName}]
   * 完全对齐 Java 版本的 serveStaticResource 方法
   */
  @Get(':deployKey/*')
  async serveStaticResource(
    @Param('deployKey') deployKey: string,
    @Param('0') resourcePath: string = '',
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      // 获取完整的请求路径
      const fullPath = request.path;
      const staticPrefix = `/api/static/${deployKey}`;
      
      // 如果是目录访问（不带斜杠），重定向到带斜杠的URL
      if (fullPath === staticPrefix) {
        const redirectUrl = request.originalUrl + '/';
        return response.redirect(HttpStatus.MOVED_PERMANENTLY, redirectUrl);
      }

      // 处理资源路径
      let finalResourcePath = resourcePath;
      
      // 如果访问根目录，默认返回 index.html
      if (!finalResourcePath || finalResourcePath === '') {
        finalResourcePath = 'index.html';
      }

      // 确保路径以 / 开头
      if (!finalResourcePath.startsWith('/')) {
        finalResourcePath = '/' + finalResourcePath;
      }

      // 构建文件路径
      const filePath = path.join(this.PREVIEW_ROOT_DIR, deployKey + finalResourcePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return response.status(HttpStatus.NOT_FOUND).send();
      }

      // 获取文件状态，确保是文件而不是目录
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return response.status(HttpStatus.NOT_FOUND).send();
      }

      // 设置Content-Type，完全对齐 Java 版本的 getContentTypeWithCharset 方法
      const contentType = this.getContentTypeWithCharset(filePath);
      response.setHeader('Content-Type', contentType);

      // 返回文件资源
      return response.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error('Static resource error:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  /**
   * 根据文件扩展名返回带字符编码的 Content-Type
   * 完全对齐 Java 版本的 getContentTypeWithCharset 方法
   */
  private getContentTypeWithCharset(filePath: string): string {
    if (filePath.endsWith('.html')) return 'text/html; charset=UTF-8';
    if (filePath.endsWith('.css')) return 'text/css; charset=UTF-8';
    if (filePath.endsWith('.js')) return 'application/javascript; charset=UTF-8';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg')) return 'image/jpeg';
    return 'application/octet-stream';
  }
}
