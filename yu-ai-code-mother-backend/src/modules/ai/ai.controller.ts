import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate/html')
  @Roles('user', 'admin')
  async generateHtmlCode(
    @Body('message') message: string,
    @CurrentUser() user,
  ) {
    const result = await this.aiService.generateHtmlCode(message);
    return {
      code: 0,
      data: {
        ...result,
        generatedBy: user.id,
        timestamp: new Date().toISOString(),
      },
      message: 'HTML代码生成成功',
    };
  }

  @Post('generate/multi-file')
  @Roles('user', 'admin')
  async generateMultiFileCode(
    @Body('message') message: string,
    @CurrentUser() user,
  ) {
    const result = await this.aiService.generateMultiFileCode(message);
    return {
      code: 0,
      data: {
        ...result,
        generatedBy: user.id,
        timestamp: new Date().toISOString(),
      },
      message: '多文件代码生成成功',
    };
  }

  @Get('usage/:userId')
  @Roles('admin')
  async getUserUsage(@Param('userId', ParseIntPipe) userId: number) {
    // 这里可以添加获取用户AI使用统计的逻辑
    return {
      code: 0,
      data: {
        userId,
        totalRequests: 0,
        lastUsed: null,
      },
      message: '获取用户使用统计成功',
    };
  }

  @Get('my-usage')
  @Roles('user', 'admin')
  async getMyUsage(@CurrentUser() user) {
    // 获取当前用户的AI使用统计
    return {
      code: 0,
      data: {
        userId: user.id,
        totalRequests: 0,
        lastUsed: null,
      },
      message: '获取个人使用统计成功',
    };
  }
}
