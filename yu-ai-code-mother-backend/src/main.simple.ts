import { NestFactory } from '@nestjs/core';
import { AppSimpleModule } from './app.simple.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppSimpleModule);
    
    app.enableCors({
      origin: true,
      credentials: true,
    });

    const port = 3000;
    await app.listen(port);
    
    console.log(`🚀 简化应用已启动，监听端口: ${port}`);
    console.log(`📚 健康检查: http://localhost:${port}/health`);
  } catch (error) {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
  }
}

bootstrap();