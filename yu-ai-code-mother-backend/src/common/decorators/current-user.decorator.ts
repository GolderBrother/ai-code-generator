import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER_LOGIN_STATE } from '../constants/user.constant';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // 从 session 中获取用户信息，与 UsersService.getLoginUser 保持一致
    return request.session?.[USER_LOGIN_STATE] || null;
  },
);
