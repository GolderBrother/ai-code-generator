import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston.logger';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  // 获取配置服务
  const configService = app.get(ConfigService);

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

  // 全局前缀
  const apiPrefix = configService.get('API_PREFIX', '/api');
  app.setGlobalPrefix(apiPrefix);

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
