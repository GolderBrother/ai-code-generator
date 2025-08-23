import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

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

  // ========== 新增的核心业务方法 ==========

  // 用户注册
  async userRegister(registerDto: RegisterDto): Promise<{ id: number; userAccount: string }> {
    const { userAccount, userPassword, checkPassword } = registerDto;
    
    // 检查密码是否一致
    if (userPassword !== checkPassword) {
      throw new ConflictException('两次输入的密码不一致');
    }

    // 检查用户账号是否已存在
    const existingUser = await this.userRepository.findByAccount(userAccount);
    if (existingUser) {
      throw new ConflictException('用户账号已存在');
    }

    // 创建用户
    const user = await this.createUser({
      userAccount,
      userPassword,
      userRole: 'user', // 默认角色
    });

    return {
      id: user.id,
      userAccount: user.userAccount,
    };
  }

  // 用户登录
  async userLogin(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { userAccount, userPassword } = loginDto;
    
    // 查找用户
    const user = await this.userRepository.findByAccount(userAccount);
    if (!user) {
      throw new UnauthorizedException('用户账号或密码错误');
    }

    // 验证密码
    const isValidPassword = await this.validatePassword(user, userPassword);
    if (!isValidPassword) {
      throw new UnauthorizedException('用户账号或密码错误');
    }

    // 生成JWT token
    const payload = { 
      sub: user.id, 
      userAccount: user.userAccount,
      userRole: user.userRole 
    };
    const token = this.jwtService.sign(payload);

    // 返回用户信息（脱敏）
    const userInfo = {
      id: user.id,
      userAccount: user.userAccount,
      userRole: user.userRole,
      createTime: user.createTime,
    };

    return { token, user: userInfo };
  }

  // 获取登录用户VO（脱敏后的用户信息）
  async getLoginUserVO(user: any): Promise<any> {
    return {
      id: user.id,
      userAccount: user.userAccount,
      userRole: user.userRole,
      createTime: user.createTime,
    };
  }

  // 用户注销
  async userLogout(userId: number): Promise<boolean> {
    // 这里可以实现token黑名单等逻辑
    // 目前简单返回true
    return true;
  }

  // 获取用户VO（脱敏后的用户信息）
  async getUserVO(user: User): Promise<any> {
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    
    return {
      id: user.id,
      userAccount: user.userAccount,
      userRole: user.userRole,
      createTime: user.createTime,
    };
  }

  // 分页获取用户列表
  async listUserVOByPage(userQueryDto: UserQueryDto): Promise<{
    records: any[];
    total: number;
    size: number;
    current: number;
  }> {
    const { current = 1, pageSize = 10 } = userQueryDto;
    
    // 获取所有用户（这里简化处理，实际应该实现分页查询）
    const users = await this.findAllUsers();
    const total = users.length;
    
    // 计算分页
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const records = users.slice(start, end).map(user => this.getUserVO(user));
    
    return {
      records: await Promise.all(records),
      total,
      size: pageSize,
      current,
    };
  }
}
