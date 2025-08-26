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
  // 应用部署根目录（用于访问部署后的应用）
  private readonly DEPLOY_ROOT_DIR = process.env.CODE_DEPLOY_ROOT_DIR || path.join(process.cwd(), 'deploy');
  // 应用生成根目录（用于尚未部署时的直接预览）
  private readonly OUTPUT_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output');

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

      // 依次尝试在部署目录与生成目录查找资源
      const candidateBases = [
        this.DEPLOY_ROOT_DIR,
        this.OUTPUT_ROOT_DIR,
      ];

      for (const baseDir of candidateBases) {
        const filePath = path.join(baseDir, deployKey + finalResourcePath);
        if (!fs.existsSync(filePath)) continue;
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) continue;
        const contentType = this.getContentTypeWithCharset(filePath);
        response.setHeader('Content-Type', contentType);
        return response.sendFile(path.resolve(filePath));
      }

      // 未找到资源
      return response.status(HttpStatus.NOT_FOUND).send();
    } catch (error) {
      console.error('Static resource error:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  /**
   * 处理不带通配符的目录访问，统一重定向到带尾斜杠路径，从而命中上面的通配符路由
   * 例如：/api/static/html_8  -> 301 -> /api/static/html_8/
   */
  @Get(':deployKey')
  async redirectDir(
    @Param('deployKey') deployKey: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const staticPrefix = `/api/static/${deployKey}`;
    const fullPath = request.path;
    if (fullPath === staticPrefix) {
      const redirectUrl = request.originalUrl + '/';
      return response.redirect(HttpStatus.MOVED_PERMANENTLY, redirectUrl);
    }
    return response.status(HttpStatus.NOT_FOUND).send();
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
