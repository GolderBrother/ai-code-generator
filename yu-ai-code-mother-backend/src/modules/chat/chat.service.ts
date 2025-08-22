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
}

