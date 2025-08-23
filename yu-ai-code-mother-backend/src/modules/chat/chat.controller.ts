import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chatHistory')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 分页查询某个应用的对话历史（游标查询）
  @Get('app/:appId')
  @UseGuards(JwtAuthGuard)
  async listAppChatHistory(
    @Param('appId', ParseIntPipe) appId: number,
    @Query('pageSize') pageSize: number = 10,
    @Query('lastCreateTime') lastCreateTime: string = '',
    @CurrentUser() user: any,
  ) {
    const result = await this.chatService.listAppChatHistoryByPage(
      appId,
      pageSize,
      lastCreateTime ? new Date(lastCreateTime) : undefined,
      user
    );
    return {
      code: 0,
      data: result,
      message: '获取应用对话历史成功',
    };
  }

  // 管理员分页查询所有对话历史
  @Post('admin/list/page/vo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAllChatHistoryByPageForAdmin(@Body() chatHistoryQueryRequest: any) {
    if (!chatHistoryQueryRequest) {
      throw new Error('查询参数不能为空');
    }
    const result = await this.chatService.listAllChatHistoryByPageForAdmin(chatHistoryQueryRequest);
    return {
      code: 0,
      data: result,
      message: '管理员获取对话历史成功',
    };
  }
}

