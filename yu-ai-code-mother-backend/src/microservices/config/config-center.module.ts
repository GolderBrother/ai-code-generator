import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigCenterService } from './config-center.service';

/**
 * 配置中心模块
 * 对齐Java版本的配置管理功能
 */
@Module({
  imports: [ConfigModule],
  providers: [ConfigCenterService],
  exports: [ConfigCenterService],
})
export class ConfigCenterModule {}