import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DeployService } from '../services/deploy.service';
import { DeployAppDto } from '../dto/deploy-app.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * 部署控制器
 * 对齐Java版本的部署接口
 */
@ApiTags('部署管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  /**
   * 部署应用
   */
  @Post('app')
  @ApiOperation({ summary: '部署应用' })
  async deployApp(@Body() deployDto: DeployAppDto, @Req() req: any) {
    const userId = req.user.userId;
    return await this.deployService.deployApp(deployDto, userId);
  }

  /**
   * 获取部署状态
   */
  @Get('status/:deployId')
  @ApiOperation({ summary: '获取部署状态' })
  async getDeployStatus(@Param('deployId') deployId: number) {
    return await this.deployService.getDeployRecord(deployId);
  }

  /**
   * 获取用户部署记录
   */
  @Get('records')
  @ApiOperation({ summary: '获取用户部署记录' })
  async getUserDeployRecords(@Req() req: any) {
    const userId = req.user.userId;
    return await this.deployService.getUserDeployRecords(userId);
  }

  /**
   * 删除部署
   */
  @Delete(':deployId')
  @ApiOperation({ summary: '删除部署' })
  async deleteDeployment(@Param('deployId') deployId: number, @Req() req: any) {
    const userId = req.user.userId;
    await this.deployService.deleteDeployment(deployId, userId);
    return { message: '删除成功' };
  }
}