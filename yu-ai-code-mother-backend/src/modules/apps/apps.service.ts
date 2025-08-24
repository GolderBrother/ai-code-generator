import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppRepository } from './repositories/app.repository';
import { App } from './entities/app.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AppsService {
  constructor(
    private readonly appRepository: AppRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * AI对话生成代码 (SSE流式)
   */
  chatToGenCode(appId: number, message: string, user: User): Observable<any> {
    return new Observable(subscriber => {
      // 异步验证应用权限
      this.getById(appId).then(app => {
        if (!app || app.userId !== user.id) {
          subscriber.error(new UnauthorizedException('无权限访问该应用'));
          return;
        }

        // 调用AI服务生成代码
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
            subscriber.next({ d: chunk });
            if (index === chunks.length - 1) {
              subscriber.complete();
            }
          }, index * 1000);
        });
      }).catch(error => {
        subscriber.error(error);
      });
    });
  }

  /**
   * 聊天生成代码 (别名方法)
   */
  chatGenCode(appId: number, message: string, user: User): Observable<any> {
    return this.chatToGenCode(appId, message, user);
  }

  /**
   * 创建应用
   */
  async createApp(createAppDto: CreateAppDto, currentUser: User): Promise<number> {
    const savedApp = await this.appRepository.create({
      ...createAppDto,
      userId: currentUser.id,
    });
    return savedApp.id;
  }

  /**
   * 根据ID获取应用
   */
  async getById(id: number): Promise<App | null> {
    return this.appRepository.findOne({ where: { id, isDelete: 0 } });
  }

  /**
   * 根据ID更新应用
   */
  async updateById(updateData: any): Promise<boolean> {
    try {
      const { id, ...data } = updateData;
      await this.appRepository.update(id, data);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 根据ID删除应用
   */
  async removeById(id: number): Promise<boolean> {
    try {
      await this.appRepository.update(id, { isDelete: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取应用VO
   */
  async getAppVO(app: App): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: app.userId } });
    return {
      ...app,
      user: user ? {
        id: user.id,
        userAccount: user.userAccount,
        userName: user.userName,
        userAvatar: user.userAvatar,
        userProfile: user.userProfile,
        userRole: user.userRole,
        createTime: user.createTime,
        updateTime: user.updateTime,
      } : null,
    };
  }

  /**
   * 获取应用VO列表
   */
  async getAppVOList(apps: App[]): Promise<any[]> {
    const userIds = apps.map(app => app.userId);
    const users = await this.userRepository.find({ where: { id: In(userIds) } });
    const userMap = new Map(users.map(user => [user.id, user]));

    return apps.map(app => ({
      ...app,
      user: userMap.get(app.userId) || null,
    }));
  }

  /**
   * 分页获取我的应用列表
   */
  async listMyAppVOByPage(appQueryDto: AppQueryDto, user: User): Promise<{
    pageNum: number;
    pageSize: number;
    totalRow: number;
    records: any[];
  }> {
    const { pageNum = 1, pageSize = 10 } = appQueryDto;
    
    // 设置查询条件：只查询当前用户的应用
    const queryDto = { ...appQueryDto, userId: user.id };
    const queryWrapper = await this.getQueryWrapper(queryDto);
    
    // 分页查询
    const appPage = await this.page(pageNum, pageSize, queryWrapper);
    
    // 数据封装
    return {
      pageNum: pageNum,
      pageSize: pageSize,
      totalRow: appPage.totalRow,
      records: await this.getAppVOList(appPage.records),
    };
  }

  /**
   * 获取查询条件
   */
  async getQueryWrapper(appQueryDto: AppQueryDto): Promise<any> {
    const where: any = { isDelete: 0 };
    
    if (appQueryDto.appName) {
      where.appName = appQueryDto.appName;
    }
    
    if (appQueryDto.userId) {
      where.userId = appQueryDto.userId;
    }
    
    if (appQueryDto.priority !== undefined) {
      where.priority = appQueryDto.priority;
    }
    
    return where;
  }

  /**
   * 分页查询
   */
  async page(pageNum: number, pageSize: number, where: any): Promise<{
    totalRow: number;
    records: App[];
  }> {
    const queryBuilder = this.appRepository.createQueryBuilder('app');
    
    // 添加基础条件
    queryBuilder.where('app.isDelete = :isDelete', { isDelete: 0 });
    
    // 添加动态条件
    if (where.appName) {
      queryBuilder.andWhere('app.appName LIKE :appName', { appName: `%${where.appName}%` });
    }
    
    if (where.userId) {
      queryBuilder.andWhere('app.userId = :userId', { userId: where.userId });
    }
    
    if (where.priority !== undefined) {
      queryBuilder.andWhere('app.priority = :priority', { priority: where.priority });
    }
    
    // 分页和排序
    const records = await queryBuilder
      .orderBy('app.createTime', 'DESC')
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    const totalRow = await queryBuilder.getCount();

    return { totalRow, records };
  }

  /**
   * 部署应用
   */
  async deployApp(appId: number, user: User): Promise<string> {
    const app = await this.getById(appId);
    if (!app || app.userId !== user.id) {
      throw new UnauthorizedException('无权限访问该应用');
    }

    // 模拟部署逻辑
    const deployUrl = `https://deployed-app-${appId}.example.com`;
    
    // 更新部署信息
    await this.updateById({
      id: appId,
      deployKey: `deploy_${appId}_${Date.now()}`,
      deployedTime: new Date(),
    });

    return deployUrl;
  }

  /**
   * 下载项目为ZIP
   */
  async downloadProjectAsZip(sourcePath: string, fileName: string, res: Response): Promise<void> {
    // 模拟下载逻辑
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.zip"`);
    res.send('Mock ZIP content');
  }

  /**
   * 创建应用 (别名方法)
   */
  async create(createAppDto: CreateAppDto, currentUser: User): Promise<App> {
    return await this.appRepository.create({
      ...createAppDto,
      userId: currentUser.id,
    });
  }
}