import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { App } from './entities/app.entity';
import { AppRepository } from './repositories/app.repository';
import { AiModule } from '../ai/ai.module';
import { ChatHistoryModule } from '../chat-history/chat-history.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([App]),
    CacheModule.register(),
    AiModule,
    ChatHistoryModule,
    UsersModule,
  ],
  controllers: [AppsController],
  providers: [AppsService, AppRepository],
  exports: [AppsService, AppRepository],
})
export class AppsModule {}
