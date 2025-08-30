import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScreenshotService, ScreenshotOptions } from './screenshot.service';
import { WebBrowsingService, BrowsingOptions } from './web-browsing.service';
import { DeploymentService, DeploymentConfig } from './deployment.service';

/**
 * Web自动化控制器
 * 对齐Java版本的Web自动化功能
 */
@ApiTags('Web自动化')
@Controller('web-automation')
export class WebAutomationController {
  constructor(
    private readonly screenshotService: ScreenshotService,
    private readonly webBrowsingService: WebBrowsingService,
    private readonly deploymentService: DeploymentService,
  ) {}

  @Post('screenshot')
  @ApiOperation({ summary: '网站截图' })
  @ApiResponse({ status: 200, description: '截图成功' })
  async takeScreenshot(@Body() params: { url: string; options?: ScreenshotOptions }) {
    return this.screenshotService.takeScreenshot(params.url, params.options);
  }

  @Post('browse')
  @ApiOperation({ summary: '浏览网站' })
  @ApiResponse({ status: 200, description: '浏览成功' })
  async browseWebsite(@Body() params: { url: string; options?: BrowsingOptions }) {
    return this.webBrowsingService.browseWebsite(params.url, params.options);
  }

  @Post('deploy')
  @ApiOperation({ summary: '部署网站' })
  @ApiResponse({ status: 200, description: '部署成功' })
  async deployWebsite(@Body() params: { projectPath: string; config: DeploymentConfig }) {
    return this.deploymentService.deployWebsite(params.projectPath, params.config);
  }

  @Get('deployment/:id/status')
  @ApiOperation({ summary: '获取部署状态' })
  @ApiResponse({ status: 200, description: '状态获取成功' })
  async getDeploymentStatus(@Param('id') deploymentId: string) {
    return this.deploymentService.getDeploymentStatus(deploymentId);
  }

  @Get('deployments')
  @ApiOperation({ summary: '获取部署历史' })
  @ApiResponse({ status: 200, description: '历史获取成功' })
  async getDeploymentHistory() {
    return this.deploymentService.getDeploymentHistory();
  }

  @Get('screenshots/history')
  @ApiOperation({ summary: '获取截图历史' })
  @ApiResponse({ status: 200, description: '历史获取成功' })
  async getScreenshotHistory(@Query('url') url?: string) {
    return this.screenshotService.getScreenshotHistory(url);
  }

  @Get('website/info')
  @ApiOperation({ summary: '获取网站信息' })
  @ApiResponse({ status: 200, description: '信息获取成功' })
  async getWebsiteInfo(@Query('url') url: string) {
    return this.webBrowsingService.getWebsiteInfo(url);
  }

  @Get('website/accessibility')
  @ApiOperation({ summary: '检查网站可访问性' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async checkWebsiteAccessibility(@Query('url') url: string) {
    return this.webBrowsingService.checkWebsiteAccessibility(url);
  }
}