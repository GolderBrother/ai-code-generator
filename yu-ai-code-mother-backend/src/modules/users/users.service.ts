import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcryptjs';
import { UserRoleEnum, DEFAULT_USER_NAME } from '../../common/enums/user-role.enum';
import { USER_LOGIN_STATE } from '../../common/constants/user.constant';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    // 检查用户账号是否已存在
    const existingUser = await this.userRepository.findByAccount(userData.userAccount);
    if (existingUser) {
      throw new ConflictException('用户账号已存在');
    }

    // 加密密码（使用与Java版本一致的加密方式）
    if (userData.userPassword) {
      userData.userPassword = this.getEncryptPassword(userData.userPassword);
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
    // 如果要更新密码，需要加密（使用与Java版本一致的加密方式）
    if (userData.userPassword) {
      userData.userPassword = this.getEncryptPassword(userData.userPassword);
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
    console.log('userRegister registerDto', registerDto)
    const { userAccount, userPassword, checkPassword } = registerDto;
    
    // 1. 校验参数
    if (!userAccount || !userPassword || !checkPassword) {
      throw new ConflictException('参数为空');
    }
    if (userAccount.length < 4) {
      throw new ConflictException('账号长度过短');
    }
    if (userPassword.length < 8 || checkPassword.length < 8) {
      throw new ConflictException('密码长度过短');
    }
    
    // 检查密码是否一致
    if (userPassword !== checkPassword) {
      throw new ConflictException('两次输入的密码不一致');
    }

    // 2. 检查用户账号是否已存在
    const existingUser = await this.userRepository.findByAccount(userAccount);
    if (existingUser) {
      throw new ConflictException('用户账号已存在');
    }

    // 3. 创建用户
    const user = await this.createUser({
      userAccount,
      userPassword,
      userName: DEFAULT_USER_NAME, // 使用常量设置默认用户名
      userRole: UserRoleEnum.USER, // 使用枚举设置默认角色
    });

    return {
      id: user.id,
      userAccount: user.userAccount,
    };
  }

  // 用户登录
  async userLogin(loginDto: LoginDto, request: any): Promise<any> {
    console.log('userLogin loginDto', loginDto)
    const { userAccount, userPassword } = loginDto;
    
    // 1. 校验参数
    if (!userAccount || !userPassword) {
      throw new UnauthorizedException('参数为空');
    }
    if (userAccount.length < 4) {
      throw new UnauthorizedException('账号长度过短');
    }
    if (userPassword.length < 8) {
      throw new UnauthorizedException('密码长度过短');
    }
    
    // 2. 加密密码
    const encryptPassword = this.getEncryptPassword(userPassword);
    
    // 3. 查询用户是否存在
    const user = await this.userRepository.findByAccount(userAccount);
    if (!user || user.userPassword !== encryptPassword) {
      throw new UnauthorizedException('用户不存在或密码错误');
    }

    // 4. 如果用户存在，记录用户的登录态
    request.session[USER_LOGIN_STATE] = user;
    
    // 5. 返回脱敏的用户信息
    return this.getLoginUserVO(user);
  }

  // 获取登录用户（从Session中获取）
  async getLoginUser(request: any): Promise<any> {
    // 先判断用户是否登录
    const userObj = request.session[USER_LOGIN_STATE];
    if (!userObj || !userObj.id) {
      return null; // 用户未登录，返回null而不是抛出异常
    }
    
    // 从数据库查询当前用户信息
    const currentUser = await this.userRepository.findById(userObj.id);
    if (!currentUser) {
      return null; // 用户不存在，返回null
    }
    
    return this.getLoginUserVO(currentUser);
  }

  // 获取登录用户VO（脱敏后的用户信息）
  async getLoginUserVO(user: any): Promise<any> {
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      userAccount: user.userAccount,
      userRole: user.userRole,
      createTime: user.createTime,
    };
  }

  // 用户注销
  async userLogout(request: any): Promise<boolean> {
    // 先判断用户是否登录
    const userObj = request.session[USER_LOGIN_STATE];
    if (!userObj) {
      throw new UnauthorizedException('用户未登录');
    }
    // 移除登录态
    delete request.session[USER_LOGIN_STATE];
    return true;
  }

  // 获取用户VO（脱敏后的用户信息）
  async getUserVO(user: User): Promise<any> {
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      userAccount: user.userAccount,
      userName: user.userName,
      userRole: user.userRole,
      createTime: user.createTime,
    };
  }

  // 批量获取用户VO列表
  async getUserVOList(userList: User[]): Promise<any[]> {
    if (!userList || userList.length === 0) {
      return [];
    }
    
    return userList.map(user => this.getUserVO(user)).filter(vo => vo !== null);
  }

  // 分页获取用户列表
  async listUserVOByPage(userQueryDto: UserQueryDto): Promise<{
    records: any[];
    total: number;
    size: number;
    current: number;
  }> {
    // 参数校验
    if (!userQueryDto) {
      throw new NotFoundException('查询参数不能为空');
    }
    
    const { current = 1, pageSize = 10 } = userQueryDto;
    
    // 获取所有用户（这里简化处理，实际应该实现分页查询）
    const users = await this.findAllUsers();
    const total = users.length;
    
    // 计算分页
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const pagedUsers = users.slice(start, end);
    
    // 转换为VO列表
    const records = await this.getUserVOList(pagedUsers);
    
    return {
      records,
      total,
      size: pageSize,
      current,
    };
  }

  // 密码加密方法（严格按照Java版本实现）
  getEncryptPassword(userPassword: string): string {
    // 盐值，混淆密码（与Java版本保持一致）
    const SALT = "yupi";
    return crypto.createHash('md5').update(userPassword + SALT).digest('hex');
  }
}
