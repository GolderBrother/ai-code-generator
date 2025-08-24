import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}

  // ========== Controller 调用的核心方法 ==========

  /**
   * 根据ID获取应用
   * @param id 应用ID
   * @returns 应用信息
   */
  async getById(id: number): Promise<App | null> {
    return this.appRepository.findOne({ where: { id } });
  }

  /**
   * 根据ID更新应用
   * @param app 应用更新数据
   * @returns 更新结果
   */
  async updateById(app: any): Promise<boolean> {
    try {
      await this.appRepository.update(app.id, app);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 根据ID删除应用
   * @param id 应用ID
   * @returns 删除结果
   */
  async removeById(id: number): Promise<boolean> {
    try {
      await this.appRepository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取应用VO（脱敏后的应用信息）
   * @param app 应用实体
   * @returns 应用VO
   */
  async getAppVO(app: App): Promise<any> {
    return {
      id: app.id,
      appName: app.appName,
      appDesc: app.appDesc,
      appIcon: app.appIcon,
      appType: app.appType,
      appStatus: app.appStatus,
      createTime: app.createTime,
      updateTime: app.updateTime,
      // 可以包含用户信息等
    };
  }

  /**
   * 获取查询包装器
   * @param appQueryDto 查询条件
   * @returns 查询包装器
   */
  async getQueryWrapper(appQueryDto: AppQueryDto): Promise<any> {
    const where: any = {};
    
    if (appQueryDto.userId) {
      where.userId = appQueryDto.userId;
    }
    
    if (appQueryDto.appName) {
      where.appName = { $like: `%${appQueryDto.appName}%` };
    }
    
    if (appQueryDto.appType) {
      where.appType = appQueryDto.appType;
    }
    
    if (appQueryDto.priority) {
      where.priority = appQueryDto.priority;
    }
    
    return where;
  }

  /**
   * 分页查询
   * @param pageNum 页码
   * @param pageSize 页大小
   * @param queryWrapper 查询条件
   * @returns 分页结果
   */
  async page(pageNum: number, pageSize: number, queryWrapper: any): Promise<{
    records: App[];
    totalRow: number;
  }> {
    const skip = (pageNum - 1) * pageSize;
    
    // 使用 repository 的原生方法
    const queryBuilder = this.appRepository['appRepository'].createQueryBuilder('app')
      .where('app.isDelete = :isDelete', { isDelete: false });
    
    // 添加查询条件
    if (queryWrapper.userId) {
      queryBuilder.andWhere('app.userId = :userId', { userId: queryWrapper.userId });
    }
    
    if (queryWrapper.appName) {
      queryBuilder.andWhere('app.appName LIKE :appName', { appName: `%${queryWrapper.appName}%` });
    }
    
    if (queryWrapper.appType) {
      queryBuilder.andWhere('app.appType = :appType', { appType: queryWrapper.appType });
    }
    
    if (queryWrapper.priority) {
      queryBuilder.andWhere('app.priority = :priority', { priority: queryWrapper.priority });
    }
    
    const [records, totalRow] = await Promise.all([
      queryBuilder
        .orderBy('app.createTime', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany(),
      queryBuilder.getCount()
    ]);
    
    return { records, totalRow };
  }

  /**
   * 获取应用VO列表
   * @param apps 应用列表
   * @returns 应用VO列表
   */
  async getAppVOList(apps: App[]): Promise<any[]> {
    return Promise.all(apps.map(app => this.getAppVO(app)));
  }

  /**
   * 下载项目为ZIP
   * @param sourceDirPath 源目录路径
   * @param downloadFileName 下载文件名
   * @param res 响应对象
   */
  async downloadProjectAsZip(sourceDirPath: string, downloadFileName: string, res: Response): Promise<void> {
    const archiver = require('archiver');
    const fs = require('fs');
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}.zip"`);
    
    // 创建压缩流
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // 处理错误
    archive.on('error', (err) => {
      throw err;
    });
    
    // 将压缩流管道到响应
    archive.pipe(res);
    
    // 添加目录到压缩包
    archive.directory(sourceDirPath, false);
    
    // 完成压缩
    await archive.finalize();
  }

  /**
   * 创建应用
   * @param createAppDto 创建应用请求
   * @param user 当前用户
   * @returns 应用ID
   */
  async createApp(createAppDto: CreateAppDto, user: User): Promise<number> {
    const app = await this.appRepository.create({
      ...createAppDto,
      userId: user.id,
      createTime: new Date(),
      updateTime: new Date(),
    });
    const savedApp = await this.appRepository.save(app);
    return savedApp.id;
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
  // async getAppVOById(id: number): Promise<any> {
  //   const app = await this.findAppById(id);
    
  //   return {
  //     id: app.id,
  //     appName: app.appName,
  //     appDesc: app.appDesc,
  //     appIcon: app.appIcon,
  //     appType: app.appType,
  //     appStatus: app.appStatus,
  //     createTime: app.createTime,
  //     updateTime: app.updateTime,
  //   };
  // }

  // 分页获取我的应用列表
  async listMyAppVOByPage(appQueryDto: AppQueryDto, user: User): Promise<{
    pageNum: number;
    pageSize: number;
    totalRow: number;
    records: any[];
  }> {
    // Service层负责：业务逻辑校验、数据处理、业务规则
    const { pageNum = 1, pageSize = 10 } = appQueryDto;
    
    // 业务规则：限制每页最多 20 个
    if (pageSize > 20) {
      throw new Error('每页最多查询 20 个应用');
    }
    
    // 设置查询条件：只查询当前用户的应用
    const queryDto = { ...appQueryDto, userId: user.id };
    
    // 构建查询条件
    const queryWrapper = await this.getQueryWrapper(queryDto);
    
    // 执行分页查询
    const appPage = await this.page(pageNum, pageSize, queryWrapper);
    
    // 数据封装：转换为VO
    const records = await this.getAppVOList(appPage.records);
    
    return {
      pageNum,
      pageSize,
      totalRow: appPage.totalRow,
      records,
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
    const records = apps.slice(start, end).map(app => this.getAppVO(app));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }

  // 管理员删除应用
  async deleteAppByAdmin(id: number): Promise<boolean> {
    return this.appRepository.delete(id);
  }

  // 管理员更新应用
  async updateAppByAdmin(updateDto: any): Promise<boolean> {
    const { id, ...updateData } = updateDto;
    await this.appRepository.update(id, updateData);
    return true;
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
    const records = apps.slice(start, end).map(app => this.getAppVO(app));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }

  // 管理员获取应用详情
  // async getAppVOByIdByAdmin(id: number): Promise<any> {
  //   const app = await this.findAppById(id);
    
  //   // 管理员可以看到更多信息
  //   return {
  //     id: app.id,
  //     appName: app.appName,
  //     appDesc: app.appDesc,
  //     appIcon: app.appIcon,
  //     appType: app.appType,
  //     appStatus: app.appStatus,
  //     userId: app.userId,
  //     createTime: app.createTime,
  //     updateTime: app.updateTime,
  //   };
  // }
}

