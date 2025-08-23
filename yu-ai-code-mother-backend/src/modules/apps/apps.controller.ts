import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
  Sse,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';

@Controller('app')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  /**
   * AI对话生成代码 (SSE流式)
   * @param appId 应用ID
   * @param message 对话消息
   * @param user 当前用户
   * @returns SSE流式响应
   */
  @Get('chat/gen/code')
  @UseGuards(JwtAuthGuard)
  async chatToGenCode(
    @Query('appId') appId: number,
    @Query('message') message: string,
    @CurrentUser() user,
  ) {
    if (!appId || appId <= 0) {
      throw new Error('应用ID错误');
    }
    if (!message || message.trim() === '') {
      throw new Error('提示词不能为空');
    }
    return this.appsService.chatToGenCode(appId, message, user);
  }

  /**
   * 应用部署
   * @param deployRequest 部署请求
   * @param user 当前用户
   * @returns 部署URL
   */
  @Post('deploy')
  @UseGuards(JwtAuthGuard)
  async deployApp(@Body() deployRequest: { appId: number }, @CurrentUser() user) {
    if (!deployRequest || !deployRequest.appId || deployRequest.appId <= 0) {
      throw new Error('应用ID不能为空');
    }
    const deployUrl = await this.appsService.deployApp(deployRequest.appId, user);
    return {
      code: 0,
      data: deployUrl,
      message: '应用部署成功',
    };
  }

  /**
   * 下载应用代码
   * @param appId 应用ID
   * @param user 当前用户
   * @param res 响应对象
   * @returns 文件下载
   */
  @Get('download/:appId')
  @UseGuards(JwtAuthGuard)
  async downloadAppCode(
    @Param('appId', ParseIntPipe) appId: number,
    @CurrentUser() user,
    @Res() res: any,
  ) {
    if (!appId || appId <= 0) {
      throw new Error('应用ID无效');
    }
    return this.appsService.downloadAppCode(appId, user, res);
  }

  /**
   * 创建应用
   * @param createAppDto 创建应用请求
   * @param user 当前用户
   * @returns 应用ID
   */
  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addApp(@Body() createAppDto: CreateAppDto, @CurrentUser() user) {
    if (!createAppDto) {
      throw new Error('创建应用参数不能为空');
    }
    const appId = await this.appsService.createApp(createAppDto, user);
    return {
      code: 0,
      data: appId,
      message: '应用创建成功',
    };
  }

  /**
   * 更新应用（用户只能更新自己的应用名称）
   * @param updateDto 更新请求
   * @param user 当前用户
   * @returns 更新结果
   */
  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateApp(@Body() updateDto: UpdateAppDto & { id: number }, @CurrentUser() user) {
    if (!updateDto || !updateDto.id || updateDto.id <= 0) {
      throw new Error('应用ID不能为空或无效');
    }
    const result = await this.appsService.updateApp(updateDto.id, updateDto, user);
    return {
      code: 0,
      data: true,
      message: '应用更新成功',
    };
  }

  /**
   * 删除应用（用户只能删除自己的应用）
   * @param deleteRequest 删除请求
   * @param user 当前用户
   * @returns 删除结果
   */
  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async deleteApp(@Body() deleteRequest: { id: number }, @CurrentUser() user) {
    if (!deleteRequest || !deleteRequest.id || deleteRequest.id <= 0) {
      throw new Error('参数错误：应用ID不能为空或无效');
    }
    const result = await this.appsService.deleteApp(deleteRequest.id, user);
    return {
      code: 0,
      data: result,
      message: '应用删除成功',
    };
  }

  /**
   * 根据id获取应用详情
   * @param id 应用ID
   * @returns 应用详情
   */
  @Get('get/vo')
  async getAppVOById(@Query('id', ParseIntPipe) id: number) {
    if (!id || id <= 0) {
      throw new Error('应用ID参数错误');
    }
    const appVO = await this.appsService.getAppVOById(id);
    return {
      code: 0,
      data: appVO,
      message: '获取应用详情成功',
    };
  }

  /**
   * 分页获取当前用户创建的应用列表
   * @param appQueryDto 查询请求
   * @param user 当前用户
   * @returns 应用列表
   */
  @Post('my/list/page/vo')
  @UseGuards(JwtAuthGuard)
  async listMyAppVOByPage(@Body() appQueryDto: AppQueryDto, @CurrentUser() user) {
    if (!appQueryDto) {
      throw new Error('查询参数不能为空');
    }
    // 限制每页最多 20 个
    if (appQueryDto.pageSize && appQueryDto.pageSize > 20) {
      throw new Error('每页最多查询 20 个应用');
    }
    const result = await this.appsService.listMyAppVOByPage(appQueryDto, user);
    return {
      code: 0,
      data: result,
      message: '获取我的应用列表成功',
    };
  }

  /**
   * 分页获取精选应用列表
   * @param appQueryDto 查询请求
   * @returns 精选应用列表
   */
  @Post('good/list/page/vo')
  async listGoodAppVOByPage(@Body() appQueryDto: AppQueryDto) {
    if (!appQueryDto) {
      throw new Error('查询参数不能为空');
    }
    // 限制每页最多 20 个
    if (appQueryDto.pageSize && appQueryDto.pageSize > 20) {
      throw new Error('每页最多查询 20 个应用');
    }
    const result = await this.appsService.listGoodAppVOByPage(appQueryDto);
    return {
      code: 0,
      data: result,
      message: '获取精选应用列表成功',
    };
  }

  /**
   * 管理员删除应用
   * @param deleteRequest 删除请求
   * @returns 删除结果
   */
  @Post('admin/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAppByAdmin(@Body() deleteRequest: { id: number }) {
    if (!deleteRequest || !deleteRequest.id || deleteRequest.id <= 0) {
      throw new Error('参数错误：应用ID不能为空或无效');
    }
    const result = await this.appsService.deleteAppByAdmin(deleteRequest.id);
    return {
      code: 0,
      data: result,
      message: '管理员删除应用成功',
    };
  }

  /**
   * 管理员更新应用
   * @param updateDto 更新请求
   * @returns 更新结果
   */
  @Post('admin/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAppByAdmin(@Body() updateDto: any) {
    if (!updateDto || !updateDto.id || updateDto.id <= 0) {
      throw new Error('应用ID不能为空或无效');
    }
    const result = await this.appsService.updateAppByAdmin(updateDto);
    return {
      code: 0,
      data: true,
      message: '管理员更新应用成功',
    };
  }

  /**
   * 管理员分页获取应用列表
   * @param appQueryDto 查询请求
   * @returns 应用列表
   */
  @Post('admin/list/page/vo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAppVOByPageByAdmin(@Body() appQueryDto: AppQueryDto) {
    if (!appQueryDto) {
      throw new Error('查询参数不能为空');
    }
    const result = await this.appsService.listAppVOByPageByAdmin(appQueryDto);
    return {
      code: 0,
      data: result,
      message: '管理员获取应用列表成功',
    };
  }

  /**
   * 管理员根据id获取应用详情
   * @param id 应用ID
   * @returns 应用详情
   */
  @Get('admin/get/vo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAppVOByIdByAdmin(@Query('id', ParseIntPipe) id: number) {
    if (!id || id <= 0) {
      throw new Error('应用ID参数错误');
    }
    const appVO = await this.appsService.getAppVOByIdByAdmin(id);
    return {
      code: 0,
      data: appVO,
      message: '管理员获取应用详情成功',
    };
  }
}

