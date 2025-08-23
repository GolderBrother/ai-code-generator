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

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:appId')
  @Roles('user', 'admin')
  async getChatHistory(
    @Param('appId', ParseIntPipe) appId: number,
    @Query('limit') limit: number = 20,
    @CurrentUser() user,
  ) {
    const history = await this.chatService.getChatHistoryByAppId(appId, limit);
    return {
      code: 0,
      data: history,
      message: '获取聊天历史成功',
    };
  }

  @Get('history/user/:userId')
  @Roles('admin')
  async getUserChatHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit') limit: number = 20,
  ) {
    const history = await this.chatService.getChatHistoryByUserId(userId, limit);
    return {
      code: 0,
      data: history,
      message: '获取用户聊天历史成功',
    };
  }

  @Delete('message/:id')
  @Roles('user', 'admin')
  async deleteChatMessage(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    await this.chatService.deleteChatMessage(id);
    return {
      code: 0,
      message: '删除聊天记录成功',
    };
  }

  @Get('count/:appId')
  @Roles('user', 'admin')
  async getChatMessageCount(@Param('appId', ParseIntPipe) appId: number, @CurrentUser() user) {
    const count = await this.chatService.getChatMessageCount(appId);
    return {
      code: 0,
      data: { count },
      message: '获取聊天记录数量成功',
    };
  }
}

