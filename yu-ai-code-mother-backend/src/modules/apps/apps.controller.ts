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

@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  @Roles('user', 'admin')
  async createApp(@Body() createAppDto: CreateAppDto, @CurrentUser() user) {
    const app = await this.appsService.createApp(createAppDto, user);
    return {
      code: 0,
      data: app,
      message: '应用创建成功',
    };
  }

  @Get(':id')
  async getAppById(@Param('id', ParseIntPipe) id: number) {
    const app = await this.appsService.findAppById(id);
    return {
      code: 0,
      data: app,
      message: '获取应用成功',
    };
  }

  @Get()
  async getAppsByUserId(@Query() query: AppQueryDto, @CurrentUser() user) {
    const apps = await this.appsService.findAppsByUserId(user.id, query);
    const total = await this.appsService.countByUserId(user.id);
    
    return {
      code: 0,
      data: {
        records: apps,
        total,
        size: query.pageSize,
        current: query.current,
      },
      message: '获取应用列表成功',
    };
  }

  @Put(':id')
  @Roles('user', 'admin')
  async updateApp(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppDto: UpdateAppDto,
    @CurrentUser() user,
  ) {
    const app = await this.appsService.updateApp(id, updateAppDto, user);
    return {
      code: 0,
      data: app,
      message: '应用更新成功',
    };
  }

  @Delete(':id')
  @Roles('user', 'admin')
  async deleteApp(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    await this.appsService.deleteApp(id, user);
    return {
      code: 0,
      message: '应用删除成功',
    };
  }

  @Post(':id/deploy')
  async deployApp(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    const deployUrl = await this.appsService.deployApp(id, user);
    return {
      code: 0,
      data: { deployUrl },
      message: '应用部署成功',
    };
  }

  // ========== 补充缺失的接口 ==========

  // AI对话生成代码 (SSE流式)
  @Sse('chat/gen/code')
  @UseGuards(JwtAuthGuard)
  async chatToGenCode(
    @Query('appId') appId: number,
    @Query('message') message: string,
    @CurrentUser() user,
  ) {
    return this.appsService.chatToGenCode(appId, message, user);
  }

  // 下载应用代码
  @Get('download/:appId')
  @UseGuards(JwtAuthGuard)
  async downloadAppCode(
    @Param('appId', ParseIntPipe) appId: number,
    @CurrentUser() user,
    @Res() res: any,
  ) {
    return this.appsService.downloadAppCode(appId, user, res);
  }

  // 获取应用VO（脱敏后的应用信息）
  @Get('get/vo/:id')
  async getAppVOById(@Param('id', ParseIntPipe) id: number) {
    const appVO = await this.appsService.getAppVOById(id);
    return {
      code: 0,
      data: appVO,
      message: '获取应用信息成功',
    };
  }

  // 分页获取我的应用列表
  @Post('my/list/page/vo')
  @UseGuards(JwtAuthGuard)
  async listMyAppVOByPage(
    @Body() appQueryDto: AppQueryDto,
    @CurrentUser() user,
  ) {
    const result = await this.appsService.listMyAppVOByPage(appQueryDto, user);
    return {
      code: 0,
      data: result,
      message: '获取我的应用列表成功',
    };
  }

  // 分页获取精选应用列表
  @Post('good/list/page/vo')
  async listGoodAppVOByPage(@Body() appQueryDto: AppQueryDto) {
    const result = await this.appsService.listGoodAppVOByPage(appQueryDto);
    return {
      code: 0,
      data: result,
      message: '获取精选应用列表成功',
    };
  }

  // 管理员删除应用
  @Post('admin/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAppByAdmin(@Body() deleteRequest: { id: number }) {
    const result = await this.appsService.deleteAppByAdmin(deleteRequest.id);
    return {
      code: 0,
      data: result,
      message: '管理员删除应用成功',
    };
  }

  // 管理员更新应用
  @Post('admin/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAppByAdmin(@Body() updateDto: any) {
    const result = await this.appsService.updateAppByAdmin(updateDto);
    return {
      code: 0,
      data: result,
      message: '管理员更新应用成功',
    };
  }

  // 管理员分页获取应用列表
  @Post('admin/list/page/vo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAppVOByPageByAdmin(@Body() appQueryDto: AppQueryDto) {
    const result = await this.appsService.listAppVOByPageByAdmin(appQueryDto);
    return {
      code: 0,
      data: result,
      message: '管理员获取应用列表成功',
    };
  }

  // 管理员获取应用详情
  @Get('admin/get/vo/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAppVOByIdByAdmin(@Param('id', ParseIntPipe) id: number) {
    const appVO = await this.appsService.getAppVOByIdByAdmin(id);
    return {
      code: 0,
      data: appVO,
      message: '管理员获取应用详情成功',
    };
  }
}

