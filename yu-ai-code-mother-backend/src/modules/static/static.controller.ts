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

@Controller('static')
export class StaticController {
  // 应用生成根目录（用于浏览）
  private readonly PREVIEW_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || './output';

  /**
   * 提供静态资源访问，支持目录重定向
   * 访问格式：http://localhost:3000/api/static/{deployKey}[/{fileName}]
   */
  @Get(':deployKey/*path')
  async serveStaticResource(
    @Param('deployKey') deployKey: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      // 获取资源路径
      const fullPath = request.path;
      let resourcePath = fullPath.substring(`/static/${deployKey}`.length);

      // 如果是目录访问（不带斜杠），重定向到带斜杠的URL
      if (resourcePath === '') {
        return response.redirect(HttpStatus.MOVED_PERMANENTLY, request.url + '/');
      }

      // 默认返回 index.html
      if (resourcePath === '/') {
        resourcePath = '/index.html';
      }

      // 构建文件路径
      const filePath = path.join(this.PREVIEW_ROOT_DIR, deployKey, resourcePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return response.status(HttpStatus.NOT_FOUND).send('File not found');
      }

      // 获取文件状态
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return response.status(HttpStatus.NOT_FOUND).send('Not a file');
      }

      // 设置Content-Type
      const contentType = this.getContentTypeWithCharset(filePath);
      response.setHeader('Content-Type', contentType);

      // 返回文件
      return response.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error('Static resource error:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error');
    }
  }

  /**
   * 根据文件扩展名返回带字符编码的 Content-Type
   */
  private getContentTypeWithCharset(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.html':
        return 'text/html; charset=UTF-8';
      case '.css':
        return 'text/css; charset=UTF-8';
      case '.js':
        return 'application/javascript; charset=UTF-8';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.json':
        return 'application/json; charset=UTF-8';
      default:
        return 'application/octet-stream';
    }
  }
}