import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Req
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { ChatHistoryAddDto, ChatHistoryUpdateDto } from './dto';

@Controller('chatHistory')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 创建聊天记录
   */
  @Post('/add')
  async addChatHistory(
    @Body() chatHistoryAddDto: ChatHistoryAddDto,
    @Req() req
  ) {
    if (!chatHistoryAddDto) {
      throw new HttpException('请求参数为空', HttpStatus.BAD_REQUEST);
    }
    
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.addChatHistory(chatHistoryAddDto, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 删除聊天记录
   */
  @Post('/delete')
  async deleteChatHistory(
    @Body('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    if (!id || id <= 0) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.deleteChatHistory(id, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 更新聊天记录
   */
  @Post('/update')
  async updateChatHistory(
    @Body() chatHistoryUpdateDto: ChatHistoryUpdateDto & { id: number },
    @Req() req
  ) {
    if (!chatHistoryUpdateDto || !chatHistoryUpdateDto.id) {
      throw new HttpException('请求参数为空', HttpStatus.BAD_REQUEST);
    }
    
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.updateChatHistory(chatHistoryUpdateDto, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 根据 id 获取聊天记录
   */
  @Get('/get')
  async getChatHistoryById(
    @Query('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    if (!id || id <= 0) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.getChatHistoryById(id, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 分页获取聊天记录列表
   */
  @Post('/list/page')
  async listChatHistoryByPage(
    @Body() queryDto: any,
    @Req() req
  ) {
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.listChatHistoryByPage(queryDto, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 分页获取聊天记录列表（管理员）
   */
  @Post('/list/page/vo')
  async listChatHistoryVOByPage(
    @Body() queryDto: any,
    @Req() req
  ) {
    const loginUser = await this.usersService.getLoginUser(req);
    // 检查管理员权限
    if (loginUser.userRole !== 'admin') {
      throw new HttpException('无权限', HttpStatus.FORBIDDEN);
    }
    
    const result = await this.chatService.listChatHistoryVOByPage(queryDto);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 分页获取当前用户的聊天记录列表
   */
  @Post('/my/list/page/vo')
  async listMyChatHistoryVOByPage(
    @Body() queryDto: any,
    @Req() req
  ) {
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.chatService.listMyChatHistoryVOByPage(queryDto, loginUser);
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }

  /**
   * 分页查询某个应用的对话历史（游标查询）
   */
  @Get('/app/:appId')
  async listAppChatHistory(
    @Param('appId', ParseIntPipe) appId: number,
    @Req() req,
    @Query('pageSize') pageSize: number = 10,
    @Query('lastCreateTime') lastCreateTime?: string
  ) {
    if (!appId || appId <= 0) {
      throw new HttpException('应用ID无效', HttpStatus.BAD_REQUEST);
    }

    const loginUser = await this.usersService.getLoginUser(req);
    const lastCreateTimeDate = lastCreateTime ? new Date(lastCreateTime) : undefined;
    const result = await this.chatService.listAppChatHistoryByPage(
      appId, 
      pageSize, 
      lastCreateTimeDate, 
      loginUser
    );
    
    return {
      code: 0,
      data: result,
      message: 'ok'
    };
  }
}