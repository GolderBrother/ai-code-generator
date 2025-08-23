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

  // 分页查询某个应用的对话历史（游标查询）
  async findByAppIdWithPagination(
    appId: number,
    pageSize: number = 10,
    lastCreateTime?: Date
  ): Promise<ChatHistory[]> {
    const queryBuilder = this.chatHistoryRepository
      .createQueryBuilder('chatHistory')
      .where('chatHistory.appId = :appId', { appId })
      .andWhere('chatHistory.isDelete = :isDelete', { isDelete: false })
      .orderBy('chatHistory.createTime', 'DESC')
      .take(pageSize);

    if (lastCreateTime) {
      queryBuilder.andWhere('chatHistory.createTime < :lastCreateTime', { lastCreateTime });
    }

    return queryBuilder.getMany();
  }

  // 查询所有聊天历史（支持条件查询和分页）
  async findAndCount(options: {
    where?: any;
    skip?: number;
    take?: number;
    order?: any;
  }): Promise<[ChatHistory[], number]> {
    return this.chatHistoryRepository.findAndCount({
      ...options,
      where: {
        ...options.where,
        isDelete: false,
      },
    });
  }

  // 查询所有聊天历史
  async findAll(): Promise<ChatHistory[]> {
    return this.chatHistoryRepository.find({
      where: { isDelete: false },
      order: { createTime: 'DESC' },
      relations: ['user', 'app'],
    });
  }
}

