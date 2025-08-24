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
  Req,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AppDeployDto } from './dto/app-deploy.dto';
import { AppAdminUpdateDto } from './dto/app-admin-update.dto';

@Controller('app')
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * AI对话生成代码 (SSE流式)
   * @param appId 应用ID
   * @param message 对话消息
   * @param req 请求对象
   * @returns SSE流式响应
   */
  @Get('chat/gen/code')
  @Sse()
  async chatToGenCode(
    @Query('appId', ParseIntPipe) appId: number,
    @Query('message') message: string,
    @Req() req,
  ) {
    if (!appId || appId <= 0) {
      throw new Error('应用 id 错误');
    }
    if (!message || message.trim() === '') {
      throw new Error('提示词不能为空');
    }
    // 获取当前登录用户
    const loginUser = await this.usersService.getLoginUser(req);
    // 调用服务生成代码（SSE 流式返回）
    return this.appsService.chatToGenCode(appId, message, loginUser);
  }

  /**
   * 应用部署
   * @param deployRequest 部署请求
   * @param req 请求对象
   * @returns 部署URL
   */
  @Post('deploy')
  async deployApp(@Body() deployRequest: AppDeployDto, @Req() req) {
    // 检查部署请求是否为空
    if (!deployRequest) {
      throw new Error('参数错误');
    }
    // 获取应用 ID
    const appId = deployRequest.appId;
    // 检查应用 ID 是否为空
    if (!appId || appId <= 0) {
      throw new Error('应用 ID 不能为空');
    }
    // 获取当前登录用户
    const loginUser = await this.usersService.getLoginUser(req);
    // 调用服务部署应用
    const deployUrl = await this.appsService.deployApp(appId, loginUser);
    // 返回部署 URL
    return {
      code: 0,
      data: deployUrl,
      message: '应用部署成功',
    };
  }

  /**
   * 下载应用代码
   * @param appId 应用ID
   * @param req 请求对象
   * @param res 响应对象
   * @returns 文件下载
   */
  @Get('download/:appId')
  async downloadAppCode(
    @Param('appId', ParseIntPipe) appId: number,
    @Req() req,
    @Res() res: any,
  ) {
    // 1. 基础校验
    if (!appId || appId <= 0) {
      throw new Error('应用ID无效');
    }
    // 2. 查询应用信息
    const app = await this.appsService.getById(appId);
    if (!app) {
      throw new Error('应用不存在');
    }
    // 3. 权限校验：只有应用创建者可以下载代码
    const loginUser = await this.usersService.getLoginUser(req);
    if (app.userId !== loginUser.id) {
      throw new Error('无权限下载该应用代码');
    }
    // 4. 构建应用代码目录路径（生成目录，非部署目录）
    const codeGenType = app.codeGenType;
    const sourceDirName = `${codeGenType}_${appId}`;
    const sourceDirPath = `${process.env.CODE_OUTPUT_ROOT_DIR}/${sourceDirName}`;
    // 5. 检查代码目录是否存在
    const fs = require('fs');
    if (!fs.existsSync(sourceDirPath) || !fs.statSync(sourceDirPath).isDirectory()) {
      throw new Error('应用代码不存在，请先生成代码');
    }
    // 6. 生成下载文件名（不建议添加中文内容）
    const downloadFileName = String(appId);
    // 7. 调用通用下载服务
    return this.appsService.downloadProjectAsZip(sourceDirPath, downloadFileName, res);
  }

  /**
   * 创建应用
   * @param createAppDto 创建应用请求
   * @param req 请求对象
   * @returns 应用ID
   */
  @Post('add')
  async addApp(@Body() createAppDto: CreateAppDto, @Req() req) {
    if (!createAppDto) {
      throw new Error('参数错误');
    }
    // 获取当前登录用户
    const loginUser = await this.usersService.getLoginUser(req);
    const appId = await this.appsService.createApp(createAppDto, loginUser);
    return {
      code: 0,
      data: appId,
      message: '应用创建成功',
    };
  }

  /**
   * 更新应用（用户只能更新自己的应用名称）
   * @param updateDto 更新请求
   * @param req 请求对象
   * @returns 更新结果
   */
  @Post('update')
  async updateApp(@Body() updateDto: UpdateAppDto & { id: number }, @Req() req) {
    if (!updateDto || !updateDto.id) {
      throw new Error('参数错误');
    }
    const loginUser = await this.usersService.getLoginUser(req);
    const id = updateDto.id;
    // 判断是否存在
    const oldApp = await this.appsService.getById(id);
    if (!oldApp) {
      throw new Error('应用不存在');
    }
    // 仅本人可更新
    if (oldApp.userId !== loginUser.id) {
      throw new Error('无权限');
    }
    const app = {
      id: id,
      appName: updateDto.appName,
      // 设置编辑时间
      editTime: new Date(),
    };
    const result = await this.appsService.updateById(app);
    if (!result) {
      throw new Error('操作失败');
    }
    return {
      code: 0,
      data: true,
      message: '应用更新成功',
    };
  }

  /**
   * 删除应用（用户只能删除自己的应用）
   * @param deleteRequest 删除请求
   * @param req 请求对象
   * @returns 删除结果
   */
  @Post('delete')
  async deleteApp(@Body() deleteRequest: { id: number }, @Req() req) {
    if (!deleteRequest || deleteRequest.id <= 0) {
      throw new Error('参数错误');
    }
    const loginUser = await this.usersService.getLoginUser(req);
    const id = deleteRequest.id;
    // 判断是否存在
    const oldApp = await this.appsService.getById(id);
    if (!oldApp) {
      throw new Error('应用不存在');
    }
    // 仅本人或管理员可删除
    if (oldApp.userId !== loginUser.id && loginUser.userRole !== 'admin') {
      throw new Error('无权限');
    }
    const result = await this.appsService.removeById(id);
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
    if (id <= 0) {
      throw new Error('参数错误');
    }
    // 查询数据库
    const app = await this.appsService.getById(id);
    if (!app) {
      throw new Error('应用不存在');
    }
    // 获取封装类（包含用户信息）
    const appVO = await this.appsService.getAppVO(app);
    return {
      code: 0,
      data: appVO,
      message: '获取应用详情成功',
    };
  }

  /**
   * 分页获取当前用户创建的应用列表
   * @param appQueryDto 查询请求
   * @param req 请求对象
   * @returns 应用列表
   */
  @Post('my/list/page/vo')
  async listMyAppVOByPage(@Body() appQueryDto: AppQueryDto, @Req() req) {
    // Controller只负责：参数校验、获取用户、调用Service、返回响应
    if (!appQueryDto) {
      throw new Error('参数错误');
    }
    
    const loginUser = await this.usersService.getLoginUser(req);
    const result = await this.appsService.listMyAppVOByPage(appQueryDto, loginUser);
    
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
      throw new Error('参数错误');
    }
    // 限制每页最多 20 个
    const pageSize = appQueryDto.pageSize;
    if (pageSize > 20) {
      throw new Error('每页最多查询 20 个应用');
    }
    const pageNum = appQueryDto.pageNum;
    // 只查询精选的应用
    appQueryDto.priority = parseInt(process.env.GOOD_APP_PRIORITY || '1', 10); // 精选应用优先级
    const queryWrapper = await this.appsService.getQueryWrapper(appQueryDto);
    // 分页查询
    const appPage = await this.appsService.page(pageNum, pageSize, queryWrapper);
    // 数据封装
    const appVOPage = {
      pageNum: pageNum,
      pageSize: pageSize,
      totalRow: appPage.totalRow,
      records: await this.appsService.getAppVOList(appPage.records),
    };
    return {
      code: 0,
      data: appVOPage,
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
    if (!deleteRequest || deleteRequest.id <= 0) {
      throw new Error('参数错误');
    }
    const id = deleteRequest.id;
    // 判断是否存在
    const oldApp = await this.appsService.getById(id);
    if (!oldApp) {
      throw new Error('应用不存在');
    }
    const result = await this.appsService.removeById(id);
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
  async updateAppByAdmin(@Body() updateDto: AppAdminUpdateDto) {
    if (!updateDto || !updateDto.id) {
      throw new Error('参数错误');
    }
    const id = updateDto.id;
    // 判断是否存在
    const oldApp = await this.appsService.getById(id);
    if (!oldApp) {
      throw new Error('应用不存在');
    }
    const app = {
      ...updateDto,
      // 设置编辑时间
      editTime: new Date(),
    };
    const result = await this.appsService.updateById(app);
    if (!result) {
      throw new Error('操作失败');
    }
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
      throw new Error('参数错误');
    }
    const pageNum = appQueryDto.pageNum;
    const pageSize = appQueryDto.pageSize;
    const queryWrapper = await this.appsService.getQueryWrapper(appQueryDto);
    const appPage = await this.appsService.page(pageNum, pageSize, queryWrapper);
    // 数据封装
    const appVOPage = {
      pageNum: pageNum,
      pageSize: pageSize,
      totalRow: appPage.totalRow,
      records: await this.appsService.getAppVOList(appPage.records),
    };
    return {
      code: 0,
      data: appVOPage,
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
    if (id <= 0) {
      throw new Error('参数错误');
    }
    // 查询数据库
    const app = await this.appsService.getById(id);
    if (!app) {
      throw new Error('应用不存在');
    }
    // 获取封装类
    const appVO = await this.appsService.getAppVO(app);
    return {
      code: 0,
      data: appVO,
      message: '管理员获取应用详情成功',
    };
  }
}