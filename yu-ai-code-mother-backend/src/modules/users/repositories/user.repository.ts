import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id, isDelete: 0 } });
  }

  async findByAccount(account: string): Promise<User | null> {
    return this.repository.findOne({ where: { userAccount: account, isDelete: 0 } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isDelete: 1 });
    return result.affected > 0;
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({ where: { isDelete: 0 } });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.repository.find({ where: { userRole: role, isDelete: 0 } });
  }
}