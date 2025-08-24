import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { App } from '../entities/app.entity';
import { AppQueryDto } from '../dto/app-query.dto';

@Injectable()
export class AppRepository {
  constructor(
    @InjectRepository(App)
    private readonly appRepository: Repository<App>,
  ) {}

  async findOne(options: any): Promise<App | null> {
    return this.appRepository.findOne(options);
  }

  async create(appData: Partial<App>): Promise<App> {
    const app = this.appRepository.create(appData);
    return this.appRepository.save(app);
  }

  async save(app: App): Promise<App> {
    return this.appRepository.save(app);
  }

  async update(id: number, appData: Partial<App>): Promise<void> {
    await this.appRepository.update(id, appData);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.appRepository.update(id, { isDelete: 1 });
    return result.affected > 0;
  }

  async findByUserId(userId: number, query: AppQueryDto): Promise<App[]> {
    const queryBuilder = this.appRepository.createQueryBuilder('app')
      .where('app.userId = :userId', { userId })
      .andWhere('app.isDelete = :isDelete', { isDelete: 0 });

    if (query.appName) {
      queryBuilder.andWhere('app.appName LIKE :appName', { appName: `%${query.appName}%` });
    }


    return queryBuilder
      .orderBy('app.createTime', 'DESC')
      .skip((query.current - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }

  async countByUserId(userId: number): Promise<number> {
    return this.appRepository.count({
      where: { userId, isDelete: 0 },
    });
  }

  // ========== 补充缺失的仓库方法 ==========

  // 查找所有应用
  async findAll(): Promise<App[]> {
    return this.appRepository.find({
      where: { isDelete: 0 },
      order: { createTime: 'DESC' },
    });
  }

  // 查找精选应用
  async findGoodApps(): Promise<App[]> {
    return this.appRepository.find({
      where: { 
        isDelete: 0,
      },
      order: { createTime: 'DESC' },
    });
  }

  // 通用查找方法
  async find(options: any): Promise<App[]> {
    return this.appRepository.find(options);
  }

  // 通用计数方法
  async count(options: any): Promise<number> {
    return this.appRepository.count(options);
  }

  // 创建查询构建器
  createQueryBuilder(alias: string) {
    return this.appRepository.createQueryBuilder(alias);
  }
}

