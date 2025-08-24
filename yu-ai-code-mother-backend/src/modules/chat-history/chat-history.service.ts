import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatHistoryAddDto, ChatHistoryUpdateDto, ChatHistoryQueryDto } from './dto';
import { User } from '../users/entities/user.entity';
import { App } from '../apps/entities/app.entity';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
    @InjectRepository(App)
    private readonly appRepository: Repository<App>,
  ) {}

  /**
   * 创建聊天记录
   */
  async addChatHistory(chatHistoryAddDto: ChatHistoryAddDto, loginUser: User): Promise<number> {
    const { appId, messageContent, messageType = 0 } = chatHistoryAddDto;

    // 校验应用是否存在
    const app = await this.appRepository.findOne({ where: { id: appId } });
    if (!app) {
      throw new HttpException('应用不存在', HttpStatus.NOT_FOUND);
    }

    // 创建聊天记录
    const chatHistory = this.chatHistoryRepository.create({
      appId,
      messageContent,
      messageType,
      userId: loginUser.id,
    });

    const savedChatHistory = await this.chatHistoryRepository.save(chatHistory);
    return savedChatHistory.id;
  }

  /**
   * 删除聊天记录
   */
  async deleteChatHistory(id: number, loginUser: User): Promise<boolean> {
    // 判断是否存在
    const oldChatHistory = await this.chatHistoryRepository.findOne({ where: { id } });
    if (!oldChatHistory) {
      throw new HttpException('聊天记录不存在', HttpStatus.NOT_FOUND);
    }

    // 仅本人或管理员可删除
    if (oldChatHistory.userId !== loginUser.id && loginUser.userRole !== 'admin') {
      throw new HttpException('无权限', HttpStatus.FORBIDDEN);
    }

    const result = await this.chatHistoryRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * 更新聊天记录
   */
  async updateChatHistory(
    chatHistoryUpdateDto: ChatHistoryUpdateDto & { id: number },
    loginUser: User
  ): Promise<boolean> {
    const { id, messageContent, messageType } = chatHistoryUpdateDto;

    // 判断是否存在
    const oldChatHistory = await this.chatHistoryRepository.findOne({ where: { id } });
    if (!oldChatHistory) {
      throw new HttpException('聊天记录不存在', HttpStatus.NOT_FOUND);
    }

    // 仅本人或管理员可修改
    if (oldChatHistory.userId !== loginUser.id && loginUser.userRole !== 'admin') {
      throw new HttpException('无权限', HttpStatus.FORBIDDEN);
    }

    // 更新数据
    const updateData: Partial<ChatHistory> = {};
    if (messageContent !== undefined) {
      updateData.messageContent = messageContent;
    }
    if (messageType !== undefined) {
      updateData.messageType = messageType;
    }
    updateData.updateTime = new Date();

    const result = await this.chatHistoryRepository.update(id, updateData);
    return result.affected > 0;
  }

  /**
   * 根据 id 获取聊天记录
   */
  async getChatHistoryById(id: number, loginUser: User): Promise<ChatHistory> {
    // 查询数据库
    const chatHistory = await this.chatHistoryRepository.findOne({ 
      where: { id },
      relations: ['app', 'user']
    });
    if (!chatHistory) {
      throw new HttpException('聊天记录不存在', HttpStatus.NOT_FOUND);
    }

    // 仅本人或管理员可查看
    if (chatHistory.userId !== loginUser.id && loginUser.userRole !== 'admin') {
      throw new HttpException('无权限', HttpStatus.FORBIDDEN);
    }

    return chatHistory;
  }

  /**
   * 分页获取聊天记录列表
   */
  async listChatHistoryByPage(
    queryDto: ChatHistoryQueryDto,
    loginUser: User
  ): Promise<{
    records: ChatHistory[];
    total: number;
    current: number;
    size: number;
  }> {
    const {
      current = 1,
      pageSize = 10,
      appId,
      messageContent,
      messageType,
      sortField = 'createTime',
      sortOrder = 'desc'
    } = queryDto;

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder('chatHistory')
      .leftJoinAndSelect('chatHistory.app', 'app')
      .leftJoinAndSelect('chatHistory.user', 'user');

    // 构建查询条件
    if (appId) {
      queryBuilder.andWhere('chatHistory.appId = :appId', { appId });
    }
    if (messageContent) {
      queryBuilder.andWhere('chatHistory.messageContent LIKE :messageContent', {
        messageContent: `%${messageContent}%`
      });
    }
    if (messageType !== undefined) {
      queryBuilder.andWhere('chatHistory.messageType = :messageType', { messageType });
    }

    // 仅本人或管理员可查看
    if (loginUser.userRole !== 'admin') {
      queryBuilder.andWhere('chatHistory.userId = :userId', { userId: loginUser.id });
    }

    // 排序
    queryBuilder.orderBy(`chatHistory.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // 分页
    queryBuilder.skip((current - 1) * pageSize).take(pageSize);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      total,
      current,
      size: pageSize
    };
  }

  /**
   * 分页获取聊天记录列表（管理员）
   */
  async listChatHistoryVOByPage(queryDto: ChatHistoryQueryDto): Promise<{
    records: ChatHistory[];
    total: number;
    current: number;
    size: number;
  }> {
    const {
      current = 1,
      pageSize = 10,
      appId,
      userId,
      messageContent,
      messageType,
      sortField = 'createTime',
      sortOrder = 'desc'
    } = queryDto;

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder('chatHistory')
      .leftJoinAndSelect('chatHistory.app', 'app')
      .leftJoinAndSelect('chatHistory.user', 'user');

    // 构建查询条件
    if (appId) {
      queryBuilder.andWhere('chatHistory.appId = :appId', { appId });
    }
    if (userId) {
      queryBuilder.andWhere('chatHistory.userId = :userId', { userId });
    }
    if (messageContent) {
      queryBuilder.andWhere('chatHistory.messageContent LIKE :messageContent', {
        messageContent: `%${messageContent}%`
      });
    }
    if (messageType !== undefined) {
      queryBuilder.andWhere('chatHistory.messageType = :messageType', { messageType });
    }

    // 排序
    queryBuilder.orderBy(`chatHistory.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // 分页
    queryBuilder.skip((current - 1) * pageSize).take(pageSize);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      total,
      current,
      size: pageSize
    };
  }

  /**
   * 分页获取当前用户的聊天记录列表
   */
  async listMyChatHistoryVOByPage(
    queryDto: ChatHistoryQueryDto,
    loginUser: User
  ): Promise<{
    records: ChatHistory[];
    total: number;
    current: number;
    size: number;
  }> {
    const {
      current = 1,
      pageSize = 10,
      appId,
      messageContent,
      messageType,
      sortField = 'createTime',
      sortOrder = 'desc'
    } = queryDto;

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder('chatHistory')
      .leftJoinAndSelect('chatHistory.app', 'app')
      .leftJoinAndSelect('chatHistory.user', 'user')
      .where('chatHistory.userId = :userId', { userId: loginUser.id });

    // 构建查询条件
    if (appId) {
      queryBuilder.andWhere('chatHistory.appId = :appId', { appId });
    }
    if (messageContent) {
      queryBuilder.andWhere('chatHistory.messageContent LIKE :messageContent', {
        messageContent: `%${messageContent}%`
      });
    }
    if (messageType !== undefined) {
      queryBuilder.andWhere('chatHistory.messageType = :messageType', { messageType });
    }

    // 排序
    queryBuilder.orderBy(`chatHistory.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // 分页
    queryBuilder.skip((current - 1) * pageSize).take(pageSize);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      total,
      current,
      size: pageSize
    };
  }

  /**
   * 分页查询某个应用的对话历史（游标查询）
   */
  async listAppChatHistoryByPage(
    appId: number,
    pageSize: number = 10,
    lastCreateTime?: Date,
    loginUser?: User
  ): Promise<{
    records: ChatHistory[];
    hasNext: boolean;
    nextCursor?: string;
  }> {
    // 校验应用是否存在
    const app = await this.appRepository.findOne({ where: { id: appId } });
    if (!app) {
      throw new HttpException('应用不存在', HttpStatus.NOT_FOUND);
    }

    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder('chatHistory')
      .leftJoinAndSelect('chatHistory.app', 'app')
      .leftJoinAndSelect('chatHistory.user', 'user')
      .where('chatHistory.appId = :appId', { appId });

    // 如果提供了lastCreateTime，则进行游标查询
    if (lastCreateTime) {
      queryBuilder.andWhere('chatHistory.createTime < :lastCreateTime', { lastCreateTime });
    }

    // 按创建时间倒序排列
    queryBuilder.orderBy('chatHistory.createTime', 'DESC');

    // 限制查询数量
    queryBuilder.take(pageSize);

    const records = await queryBuilder.getMany();

    return {
      records,
      hasNext: records.length === pageSize,
      nextCursor: records.length > 0 ? records[records.length - 1].createTime?.toISOString() : undefined,
    };
  }
}