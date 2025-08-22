import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: Partial<User>): Promise<User> {
    // 检查用户账号是否已存在
    const existingUser = await this.userRepository.findByAccount(userData.userAccount);
    if (existingUser) {
      throw new ConflictException('用户账号已存在');
    }

    // 加密密码
    if (userData.userPassword) {
      userData.userPassword = await bcrypt.hash(userData.userPassword, 10);
    }

    return this.userRepository.create(userData);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findUserByAccount(account: string): Promise<User> {
    const user = await this.userRepository.findByAccount(account);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // 如果要更新密码，需要加密
    if (userData.userPassword) {
      userData.userPassword = await bcrypt.hash(userData.userPassword, 10);
    }

    const updatedUser = await this.userRepository.update(id, userData);
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return this.userRepository.findByRole(role);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.userPassword);
  }
}
