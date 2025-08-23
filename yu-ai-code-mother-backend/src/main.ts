import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerUi = require('swagger-ui-express');
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
 // eslint-disable-next-line @typescript-eslint/no-var-requires
const slowDown = require('express-slow-down');
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston.logger';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule);
  
  // 获取配置服务并设置日志器
  const configService = app.get(ConfigService);
  const winstonLogger = new WinstonLogger(configService);
  app.useLogger(winstonLogger);

  // 安全中间件
  app.use(helmet());

  // 压缩中间件
  app.use(compression());

  // 限流中间件
  const limiter = rateLimit({
    windowMs: configService.get('RATE_LIMIT_WINDOW_MS', 60000),
    max: configService.get('RATE_LIMIT_MAX', 100),
    message: '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  // 慢速中间件
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15分钟
    delayAfter: 100, // 100个请求后开始延迟
    delayMs: 500, // 每个请求延迟500ms
  });
  app.use(speedLimiter);

  // 全局前缀（排除根路径与文档，不加前缀）
  const apiPrefix = configService.get('API_PREFIX', '/api');
  app.setGlobalPrefix(apiPrefix, {
    // 字符串写法表示所有方法均排除
    exclude: ['/', 'docs'],
  });

  // 放宽 Swagger 文档页的 CSP（仅限 /docs 与 /api/docs）
  app.use(['/docs', `${apiPrefix}/docs`], helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'", 'https:'],
        scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 文档（Swagger）
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI 零代码应用生成平台 - 后端 API')
    .setDescription('API 文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  // 同时提供带前缀与不带前缀的文档地址
  // 本地提供 swagger-ui 静态资源，避免 CDN/打包问题
  app.use('/swagger-ui', express.static(join(process.cwd(), 'node_modules', 'swagger-ui-dist')));

  const swaggerUiLocal = {
    swaggerOptions: { persistAuthorization: true },
    customCssUrl: '/swagger-ui/swagger-ui.css',
    customJs: ['/swagger-ui/swagger-ui-bundle.js', '/swagger-ui/swagger-ui-standalone-preset.js'],
  };
  // 使用 swagger-ui-express 提供 UI，避免打包下静态资源加载问题
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, { swaggerOptions: { persistAuthorization: true } }),
  );
  app.use(
    `${apiPrefix}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, { swaggerOptions: { persistAuthorization: true } }),
  );

  // 启动应用
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 应用已启动，监听端口: ${port}`);
  console.log(`📚 API 文档: http://localhost:${port}${apiPrefix}`);
}

bootstrap().catch((error) => {
  console.error('❌ 应用启动失败:', error);
  process.exit(1);
});
