import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'userAccount',
      passwordField: 'userPassword',
    });
  }

  async validate(userAccount: string, userPassword: string): Promise<any> {
    const user = await this.authService.validateUser(userAccount, userPassword);
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return user;
  }
}

