import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatHistoryRepository } from './repositories/chat-history.repository';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistory]),
    AiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatHistoryRepository],
  exports: [ChatService, ChatHistoryRepository],
})
export class ChatModule {}

