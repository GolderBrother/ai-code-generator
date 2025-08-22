import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(account: string, password: string): Promise<User> {
    const user = await this.usersService.findUserByAccount(account);
    if (user && await this.usersService.validatePassword(user, password)) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.userAccount, loginDto.userPassword);
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const payload = { 
      sub: user.id, 
      account: user.userAccount, 
      role: user.userRole 
    };
    
    return {
      code: 0,
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          userName: user.userName,
          userAccount: user.userAccount,
          userRole: user.userRole,
          userAvatar: user.userAvatar,
        },
      },
      message: '登录成功',
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.createUser(registerDto);
    
    const payload = { 
      sub: user.id, 
      account: user.userAccount, 
      role: user.userRole 
    };
    
    return {
      code: 0,
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          userName: user.userName,
          userAccount: user.userAccount,
          userRole: user.userRole,
          userAvatar: user.userAvatar,
        },
      },
      message: '注册成功',
    };
  }
}

