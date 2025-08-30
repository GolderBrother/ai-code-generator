import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App } from '../entities/app.entity';
import { CreateAppDto } from '../dto/create-app.dto';
import { UpdateAppDto } from '../dto/update-app.dto';

/**
 * 应用服务
 */
@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private readonly appRepository: Repository<App>,
  ) {}

  /**
   * 创建应用
   */
  async createApp(createAppDto: CreateAppDto): Promise<App> {
    const app = this.appRepository.create(createAppDto);
    return this.appRepository.save(app);
  }

  /**
   * 获取所有应用
   */
  async getAllApps(): Promise<App[]> {
    return this.appRepository.find();
  }

  /**
   * 根据ID获取应用
   */
  async getAppById(id: number): Promise<App> {
    const app = await this.appRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException(`应用 ID ${id} 不存在`);
    }
    return app;
  }

  /**
   * 更新应用
   */
  async updateApp(id: number, updateAppDto: UpdateAppDto): Promise<App> {
    await this.appRepository.update(id, updateAppDto);
    return this.getAppById(id);
  }

  /**
   * 删除应用
   */
  async deleteApp(id: number): Promise<void> {
    const result = await this.appRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`应用 ID ${id} 不存在`);
    }
  }
}