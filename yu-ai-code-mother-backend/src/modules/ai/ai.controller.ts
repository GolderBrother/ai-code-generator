import { Controller, Post, Body, Get, Param, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AiCodeGeneratorService } from './services/ai-code-generator.service';

/**
 * AI 控制器 - 简化版本，专注于核心代码生成功能
 */
@ApiTags('AI代码生成')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiCodeGeneratorService: AiCodeGeneratorService,
  ) {}

  /**
   * 生成HTML代码
   */
  @Post('generate/html')
  @ApiOperation({ summary: '生成HTML代码' })
  @ApiResponse({ status: 200, description: 'HTML代码生成成功' })
  async generateHtmlCode(@Body() body: { message: string }) {
    try {
      const result = await this.aiCodeGeneratorService.generateHtmlCode(body.message);
      return {
        success: true,
        data: result,
        message: 'HTML代码生成成功'
      };
    } catch (error) {
      this.logger.error(`HTML代码生成失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `HTML代码生成失败: ${error.message}`
      };
    }
  }

  /**
   * 生成HTML代码（流式）
   */
  @Post('generate/html/stream')
  @ApiOperation({ summary: '流式生成HTML代码' })
  @ApiResponse({ status: 200, description: 'HTML代码流式生成成功' })
  async generateHtmlCodeStream(@Body() body: { message: string }, @Res() res: Response) {
    try {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = this.aiCodeGeneratorService.generateHtmlCodeStream(body.message);
      
      stream.subscribe({
        next: (chunk) => {
          res.write(chunk);
        },
        error: (error) => {
          this.logger.error(`HTML代码流式生成失败: ${error.message}`, error.stack);
          res.write(`\n\nError: ${error.message}`);
          res.end();
        },
        complete: () => {
          res.end();
        }
      });
    } catch (error) {
      this.logger.error(`HTML代码流式生成失败: ${error.message}`, error.stack);
      res.status(500).json({
        success: false,
        message: `HTML代码流式生成失败: ${error.message}`
      });
    }
  }

  /**
   * 生成多文件代码
   */
  @Post('generate/multifile')
  @ApiOperation({ summary: '生成多文件代码' })
  @ApiResponse({ status: 200, description: '多文件代码生成成功' })
  async generateMultiFileCode(@Body() body: { message: string }) {
    try {
      const result = await this.aiCodeGeneratorService.generateMultiFileCode(body.message);
      return {
        success: true,
        data: result,
        message: '多文件代码生成成功'
      };
    } catch (error) {
      this.logger.error(`多文件代码生成失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `多文件代码生成失败: ${error.message}`
      };
    }
  }

  /**
   * 生成Vue项目代码
   */
  @Post('generate/vue')
  @ApiOperation({ summary: '生成Vue项目代码' })
  @ApiResponse({ status: 200, description: 'Vue项目代码生成成功' })
  async generateVueProjectCode(@Body() body: { message: string }) {
    try {
      const result = await this.aiCodeGeneratorService.generateVueProjectCode(body.message);
      return {
        success: true,
        data: result,
        message: 'Vue项目代码生成成功'
      };
    } catch (error) {
      this.logger.error(`Vue项目代码生成失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Vue项目代码生成失败: ${error.message}`
      };
    }
  }

  /**
   * 获取AI服务状态
   */
  @Get('status')
  @ApiOperation({ summary: '获取AI服务状态' })
  @ApiResponse({ status: 200, description: 'AI服务状态获取成功' })
  async getAiStatus() {
    try {
      return {
        success: true,
        data: {
          status: 'running',
          timestamp: new Date().toISOString(),
          service: 'AI Code Generator',
          version: '1.0.0'
        },
        message: 'AI服务运行正常'
      };
    } catch (error) {
      this.logger.error(`获取AI服务状态失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `获取AI服务状态失败: ${error.message}`
      };
    }
  }
}