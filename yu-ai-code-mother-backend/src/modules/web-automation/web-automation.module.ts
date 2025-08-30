import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebAutomationController } from './web-automation.controller';
import { ScreenshotService } from './screenshot.service';
import { WebBrowsingService } from './web-browsing.service';
import { DeploymentService } from './deployment.service';

/**
 * Web自动化模块
 * 对齐Java版本的Web自动化功能
 */
@Module({
  imports: [ConfigModule],
  controllers: [WebAutomationController],
  providers: [ScreenshotService, WebBrowsingService, DeploymentService],
  exports: [ScreenshotService, WebBrowsingService, DeploymentService],
})
export class WebAutomationModule {}