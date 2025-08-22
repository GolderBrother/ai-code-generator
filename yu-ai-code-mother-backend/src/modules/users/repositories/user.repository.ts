import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, isDelete: false } });
  }

  async findByAccount(account: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { userAccount: account, isDelete: false } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, { isDelete: true });
    return result.affected > 0;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { isDelete: false } });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.find({ where: { userRole: role, isDelete: false } });
  }
}
