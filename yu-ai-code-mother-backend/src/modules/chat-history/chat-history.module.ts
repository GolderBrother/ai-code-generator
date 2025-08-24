import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistoryController } from './chat-history.controller';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistory } from './entities/chat-history.entity';
import { UsersModule } from '../users/users.module';
import { App } from '../apps/entities/app.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistory, App]),
    UsersModule,
  ],
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService],
  exports: [ChatHistoryService],
})
export class ChatHistoryModule {}