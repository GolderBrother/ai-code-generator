import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppRepository } from './repositories/app.repository';
import { App } from './entities/app.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { AppQueryDto } from './dto/app-query.dto';
import { AiService } from '../ai/ai.service';

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
}

