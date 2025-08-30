import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeployService } from './services/deploy.service';
import { DeployController } from './controllers/deploy.controller';
import { DeployRecord } from './entities/deploy-record.entity';
import { AppsModule } from '../apps/apps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeployRecord]),
    AppsModule,
  ],
  controllers: [DeployController],
  providers: [DeployService],
  exports: [DeployService],
})
export class DeployModule {}