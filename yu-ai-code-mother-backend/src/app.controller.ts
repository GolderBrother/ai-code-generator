import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  root(): string {
    const apiPrefix = this.configService.get('API_PREFIX', '/api');
    const port = this.configService.get('PORT', 3000);
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>AI 零代码应用生成平台 - 后端</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; margin: 40px; line-height: 1.6; color: #222; }
    .container { max-width: 860px; margin: 0 auto; }
    h1 { margin: 0 0 8px; }
    .desc { color: #555; margin-bottom: 16px; }
    .links a { display: inline-block; margin-right: 12px; color: #1677ff; text-decoration: none; }
    .links a:hover { text-decoration: underline; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI 零代码应用生成平台 - NestJS 后端</h1>
    <p class="desc">这是 AI 零代码应用生成平台的后端服务，使用 NestJS + TypeScript 开发。</p>
    <div class="links">
      <a href="http://localhost:${port}${apiPrefix}/health">健康检查</a>
      <a href="http://localhost:${port}${apiPrefix}/docs">API 文档</a>
    </div>
    <h3>快速开始</h3>
    <ol>
      <li>复制环境变量：<code>cp env.example .env.local</code></li>
      <li>初始化数据库（MySQL 需先创建库）：<code>CREATE DATABASE yu_ai_code_mother CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;</code></li>
      <li>开发启动：<code>npm run start:dev</code></li>
    </ol>
    <p>更多说明见仓库内 README.md。</p>
  </div>
</body>
</html>`;
  }
}