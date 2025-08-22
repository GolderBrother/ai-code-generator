import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistory } from '../entities/chat-history.entity';

@Injectable()
export class ChatHistoryRepository {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
  ) {}

  async findByAppId(appId: number, limit: number = 20): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.find({
      where: { appId, isDelete: false },
      order: { createTime: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async findByUserId(userId: number, limit: number = 20): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.find({
      where: { userId, isDelete: false },
      order: { createTime: 'DESC' },
      take: limit,
      relations: ['app'],
    });
  }

  async create(chatHistoryData: Partial<ChatHistory>): Promise<ChatHistory> {
    const chatHistory = this.chatHistoryRepository.create(chatHistoryData);
    return this.chatHistoryRepository.save(chatHistory);
  }

  async update(id: number, chatHistoryData: Partial<ChatHistory>): Promise<ChatHistory | null> {
    await this.chatHistoryRepository.update(id, chatHistoryData);
    return this.chatHistoryRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.chatHistoryRepository.update(id, { isDelete: true });
    return result.affected > 0;
  }

  async countByAppId(appId: number): Promise<number> {
    return this.chatHistoryRepository.count({
      where: { appId, isDelete: false },
    });
  }
}

