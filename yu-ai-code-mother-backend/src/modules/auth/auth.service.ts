import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

/**
 * 认证服务
 * 对齐Java版本的认证逻辑
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findUserByAccount(username);
    if (user && await this.usersService.validatePassword(user, password)) {
      // 更新最后登录时间
      await this.usersService.updateLastLogin(user.id);
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { 
      userAccount: user.userAccount, 
      userName: user.userName,
      userRole: user.userRole,
      sub: user.id 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userName: user.userName,
        userAccount: user.userAccount,
        userRole: user.userRole,
        userAvatar: user.userAvatar,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * 用户注册
   */
  async register(registerDto: any): Promise<{ access_token: string; user: any }> {
    const existingUser = await this.usersService.findUserByAccount(registerDto.userAccount);
    if (existingUser) {
      throw new ConflictException('用户账号已存在');
    }

    const user = await this.usersService.createUser(registerDto);
    const payload = { 
      userAccount: user.userAccount, 
      userName: user.userName,
      userRole: user.userRole,
      sub: user.id 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userName: user.userName,
        userAccount: user.userAccount,
        userRole: user.userRole,
        userAvatar: user.userAvatar,
      },
    };
  }
}