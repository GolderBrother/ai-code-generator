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
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:appId')
  async getChatHistory(
    @Param('appId', ParseIntPipe) appId: number,
    @Query('limit') limit: number = 20,
  ) {
    const history = await this.chatService.getChatHistoryByAppId(appId, limit);
    return {
      code: 0,
      data: history,
      message: '获取聊天历史成功',
    };
  }

  @Get('history/user/:userId')
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
  async deleteChatMessage(@Param('id', ParseIntPipe) id: number) {
    await this.chatService.deleteChatMessage(id);
    return {
      code: 0,
      message: '删除聊天记录成功',
    };
  }

  @Get('count/:appId')
  async getChatMessageCount(@Param('appId', ParseIntPipe) appId: number) {
    const count = await this.chatService.getChatMessageCount(appId);
    return {
      code: 0,
      data: { count },
      message: '获取聊天记录数量成功',
    };
  }
}

