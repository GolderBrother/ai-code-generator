import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppSimpleModule } from './app.simple.module';

async function bootstrap() {
  const app = await NestFactory.create(AppSimpleModule);

  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // API前缀
  app.setGlobalPrefix('api');

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('AI代码生成平台 API')
    .setDescription('AI零代码应用生成平台后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 应用已启动，监听端口: ${port}`);
  console.log(`📖 API文档地址: http://localhost:${port}/api`);
}

bootstrap().catch(err => {
  console.error('应用启动失败:', err);
  process.exit(1);
});