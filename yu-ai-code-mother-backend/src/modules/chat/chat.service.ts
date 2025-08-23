import { Injectable } from '@nestjs/common';
import { ChatHistoryRepository } from './repositories/chat-history.repository';
import { ChatHistory } from './entities/chat-history.entity';

@Injectable()
export class ChatService {
  constructor(private readonly chatHistoryRepository: ChatHistoryRepository) {}

  async addChatMessage(
    appId: number,
    message: string,
    messageType: number,
    userId: number,
  ): Promise<ChatHistory> {
    return this.chatHistoryRepository.create({
      appId,
      messageContent: message,
      messageType,
      userId,
    });
  }

  async getChatHistoryByAppId(appId: number, limit: number = 20): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.findByAppId(appId, limit);
  }

  async getChatHistoryByUserId(userId: number, limit: number = 20): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.findByUserId(userId, limit);
  }

  async deleteChatMessage(id: number): Promise<boolean> {
    return this.chatHistoryRepository.delete(id);
  }

  async getChatMessageCount(appId: number): Promise<number> {
    return this.chatHistoryRepository.countByAppId(appId);
  }

  // 分页查询某个应用的对话历史（游标查询）
  async listAppChatHistoryByPage(
    appId: number,
    pageSize: number = 10,
    lastCreateTime?: Date,
    user?: any
  ): Promise<{
    records: ChatHistory[];
    hasNext: boolean;
    nextCursor?: string;
  }> {
    const histories = await this.chatHistoryRepository.findByAppIdWithPagination(
      appId,
      pageSize,
      lastCreateTime
    );
    
    return {
      records: histories,
      hasNext: histories.length === pageSize,
      nextCursor: histories.length > 0 ? histories[histories.length - 1].createTime?.toISOString() : undefined,
    };
  }

  // 管理员分页查询所有对话历史
  async listAllChatHistoryByPageForAdmin(queryRequest: any): Promise<{
    records: ChatHistory[];
    total: number;
    current: number;
    size: number;
  }> {
    const { current = 1, size = 10, appId, userId, messageType } = queryRequest;
    
    const [records, total] = await this.chatHistoryRepository.findAndCount({
      where: {
        ...(appId && { appId }),
        ...(userId && { userId }),
        ...(messageType && { messageType }),
      },
      skip: (current - 1) * size,
      take: size,
      order: { createTime: 'DESC' },
    });

    return {
      records,
      total,
      current,
      size,
    };
  }

  // 兼容方法
  async findByAppId(appId: number): Promise<ChatHistory[]> {
    return this.getChatHistoryByAppId(appId);
  }

  async findAll(): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.findAll();
  }
}

