import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppRepository } from './repositories/app.repository';
import { App } from './entities/app.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AiService } from '../ai/ai.service';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AppsService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly aiService: AiService,
  ) {}

  async createApp(createAppDto: CreateAppDto, user: User): Promise<App> {
    const app = this.appRepository.create({
      ...createAppDto,
      userId: user.id,
    });
    return this.appRepository.save(await app);
  }

  async findAppById(id: number): Promise<App> {
    const app = await this.appRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('应用不存在');
    }
    return app;
  }

  async findAppsByUserId(userId: number, query: AppQueryDto): Promise<App[]> {
    return this.appRepository.findByUserId(userId, query);
  }

  async updateApp(id: number, updateAppDto: UpdateAppDto, user: User): Promise<App> {
    const app = await this.findAppById(id);
    
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限修改该应用');
    }

    await this.appRepository.update(id, updateAppDto);
    return this.findAppById(id);
  }

  async deleteApp(id: number, user: User): Promise<boolean> {
    const app = await this.findAppById(id);
    
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限删除该应用');
    }

    return this.appRepository.delete(id);
  }

  async deployApp(id: number, user: User): Promise<string> {
    const app = await this.findAppById(id);
    
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限部署该应用');
    }

    // 这里应该实现实际的部署逻辑
    // 目前返回模拟的部署 URL
    const deployUrl = `https://deployed-app-${id}.example.com`;
    
    // 更新应用状态
    await this.appRepository.update(id, { appStatus: 1 });
    
    return deployUrl;
  }

  async countByUserId(userId: number): Promise<number> {
    return this.appRepository.countByUserId(userId);
  }

  // ========== 补充缺失的核心业务方法 ==========

  // AI对话生成代码 (SSE流式)
  async chatToGenCode(appId: number, message: string, user: User): Promise<Observable<any>> {
    // 验证应用权限
    const app = await this.findAppById(appId);
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限访问该应用');
    }

    // 调用AI服务生成代码
    // 这里应该实现实际的AI代码生成逻辑
    // 目前返回模拟的流式数据
    return new Observable(subscriber => {
      const chunks = [
        '正在分析您的需求...',
        '开始生成代码...',
        '生成HTML结构...',
        '生成CSS样式...',
        '生成JavaScript逻辑...',
        '代码生成完成！'
      ];

      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          subscriber.next({ data: chunk });
          if (index === chunks.length - 1) {
            subscriber.complete();
          }
        }, index * 1000);
      });
    });
  }

  // 下载应用代码
  async downloadAppCode(appId: number, user: User, res: Response): Promise<void> {
    const app = await this.findAppById(appId);
    
    if (app.userId !== user.id) {
      throw new UnauthorizedException('无权限下载该应用代码');
    }

    // 这里应该实现实际的代码下载逻辑
    // 目前返回模拟的下载响应
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="app-${appId}.zip"`);
    res.send('模拟的应用代码文件内容');
  }

  // 获取应用VO（脱敏后的应用信息）
  async getAppVOById(id: number): Promise<any> {
    const app = await this.findAppById(id);
    
    return {
      id: app.id,
      appName: app.appName,
      appDesc: app.appDesc,
      appIcon: app.appIcon,
      appType: app.appType,
      appStatus: app.appStatus,
      createTime: app.createTime,
      updateTime: app.updateTime,
    };
  }

  // 分页获取我的应用列表
  async listMyAppVOByPage(appQueryDto: AppQueryDto, user: User): Promise<{
    records: any[];
    total: number;
    size: number;
    current: number;
  }> {
    const { current = 1, pageSize = 10 } = appQueryDto;
    
    // 获取当前用户的应用
    const apps = await this.findAppsByUserId(user.id, appQueryDto);
    const total = await this.countByUserId(user.id);
    
    // 转换为VO
    const records = apps.map(app => this.getAppVOById(app.id));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }

  // 分页获取精选应用列表
  async listGoodAppVOByPage(appQueryDto: AppQueryDto): Promise<{
    records: any[];
    total: number;
    size: number;
    current: number;
  }> {
    const { current = 1, pageSize = 10 } = appQueryDto;
    
    // 获取精选应用（这里简化处理，实际应该根据优先级筛选）
    const apps = await this.appRepository.findGoodApps();
    const total = apps.length;
    
    // 分页处理
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const records = apps.slice(start, end).map(app => this.getAppVOById(app.id));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }

  // 管理员删除应用
  async deleteAppByAdmin(id: number): Promise<boolean> {
    const app = await this.findAppById(id);
    return this.appRepository.delete(id);
  }

  // 管理员更新应用
  async updateAppByAdmin(updateDto: any): Promise<App> {
    const { id, ...updateData } = updateDto;
    const app = await this.findAppById(id);
    
    await this.appRepository.update(id, updateData);
    return this.findAppById(id);
  }

  // 管理员分页获取应用列表
  async listAppVOByPageByAdmin(appQueryDto: AppQueryDto): Promise<{
    records: any[];
    total: number;
    size: number;
    current: number;
  }> {
    const { current = 1, pageSize = 10 } = appQueryDto;
    
    // 获取所有应用
    const apps = await this.appRepository.findAll();
    const total = apps.length;
    
    // 分页处理
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const records = apps.slice(start, end).map(app => this.getAppVOById(app.id));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }

  // 管理员获取应用详情
  async getAppVOByIdByAdmin(id: number): Promise<any> {
    const app = await this.findAppById(id);
    
    // 管理员可以看到更多信息
    return {
      id: app.id,
      appName: app.appName,
      appDesc: app.appDesc,
      appIcon: app.appIcon,
      appType: app.appType,
      appStatus: app.appStatus,
      userId: app.userId,
      createTime: app.createTime,
      updateTime: app.updateTime,
    };
  }
}

