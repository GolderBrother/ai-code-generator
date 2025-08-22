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
  Req,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { Request } from 'express';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  async createApp(@Body() createAppDto: CreateAppDto, @Req() req: Request) {
    const app = await this.appsService.createApp(createAppDto, (req as any).user);
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
  async getAppsByUserId(@Query() query: AppQueryDto, @Req() req: Request) {
    const user = (req as any).user;
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
  async updateApp(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppDto: UpdateAppDto,
    @Req() req: Request,
  ) {
    const app = await this.appsService.updateApp(id, updateAppDto, (req as any).user);
    return {
      code: 0,
      data: app,
      message: '应用更新成功',
    };
  }

  @Delete(':id')
  async deleteApp(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    await this.appsService.deleteApp(id, (req as any).user);
    return {
      code: 0,
      message: '应用删除成功',
    };
  }

  @Post(':id/deploy')
  async deployApp(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const deployUrl = await this.appsService.deployApp(id, (req as any).user);
    return {
      code: 0,
      data: { deployUrl },
      message: '应用部署成功',
    };
  }
}

