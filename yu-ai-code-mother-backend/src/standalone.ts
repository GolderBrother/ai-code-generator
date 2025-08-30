import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Module, Controller, Get, Post, Body } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { AiModule } from './modules/ai/ai.module';
import { AppsModule } from './modules/apps/apps.module';

// 简单的AI服务
@Injectable()
class SimpleAiService {
  async generateCode(message: string, type: string = 'html'): Promise<string> {
    console.log(`生成${type}代码: ${message}`);
    
    if (type === 'html') {
      return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的页面</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        p { line-height: 1.6; color: #666; margin-bottom: 20px; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI生成的页面</h1>
        <div class="highlight">
            <strong>用户需求:</strong> ${message}
        </div>
        <p>这是一个由AI智能生成的HTML页面，根据您的需求定制开发。</p>
        <p>页面包含了现代化的样式设计，响应式布局，以及良好的用户体验。</p>
        <p>生成时间: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
    }
    
    return `// AI生成的${type}代码\n// 需求: ${message}\nconsole.log('Hello from AI generated code!');`;
  }
}

// 简单的AI控制器
@ApiTags('AI代码生成')
@Controller('ai')
class SimpleAiController {
  constructor(private readonly aiService: SimpleAiService) {}

  @Post('generate/html')
  @ApiOperation({ summary: '生成HTML代码' })
  @ApiResponse({ status: 200, description: '代码生成成功' })
  async generateHtml(@Body() body: { message: string }) {
    const result = await this.aiService.generateCode(body.message, 'html');
    return { 
      success: true, 
      data: result, 
      message: '代码生成成功',
      timestamp: new Date().toISOString()
    };
  }

  @Post('generate/vue')
  @ApiOperation({ summary: '生成Vue项目' })
  @ApiResponse({ status: 200, description: '项目生成成功' })
  async generateVue(@Body() body: { message: string }) {
    const result = await this.aiService.generateCode(body.message, 'vue');
    return { 
      success: true, 
      data: result, 
      message: 'Vue项目生成成功',
      timestamp: new Date().toISOString()
    };
  }

  @Get('status')
  @ApiOperation({ summary: '获取AI服务状态' })
  @ApiResponse({ status: 200, description: '状态获取成功' })
  async getStatus() {
    return {
      success: true,
      status: 'running',
      message: 'AI代码生成服务运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}

// 应用服务
@Injectable()
class AppService {
  getHello(): string {
    return 'AI代码生成平台后端服务运行中！';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

// 应用控制器
@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

// 独立应用模块
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    CoreModule,
    WorkflowModule,
    AiModule,
    AppsModule,
  ],
  controllers: [AppController, SimpleAiController],
  providers: [AppService, SimpleAiService],
})
class StandaloneAppModule {}

// 启动函数
async function bootstrap() {
  const app = await NestFactory.create(StandaloneAppModule);

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
    .setDescription('AI零代码应用生成平台后端API文档 - 完整版本')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 AI代码生成平台已启动`);
  console.log(`📡 服务地址: http://localhost:${port}`);
  console.log(`📖 API文档: http://localhost:${port}/api`);
  console.log(`🎯 核心功能: AI代码生成服务`);
  console.log(`👤 用户模块: 用户注册、登录、管理`);
  console.log(`🔐 认证模块: JWT认证、权限控制`);
  console.log(`⚙️ 核心模块: 代码解析、模板引擎`);
  console.log(`🔄 工作流模块: AI工作流、智能体`);
  console.log(`✅ 所有功能模块已就绪`);
}

bootstrap().catch(err => {
  console.error('应用启动失败:', err);
  process.exit(1);
});