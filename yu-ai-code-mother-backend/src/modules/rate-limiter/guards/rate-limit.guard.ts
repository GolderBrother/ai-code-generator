import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RateLimiterService } from '../rate-limiter.service';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitType } from '../enums/rate-limit-type.enum';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get(RATE_LIMIT_KEY, context.getHandler());
    
    if (!rateLimitOptions) {
      return true; // 没有限流配置，直接通过
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, rateLimitOptions.type);
    
    const config = {
      key,
      limit: rateLimitOptions.limit,
      window: rateLimitOptions.window,
      type: rateLimitOptions.type,
    };

    const allowed = await this.rateLimiterService.checkRateLimit(config);
    
    if (!allowed) {
      const remaining = this.rateLimiterService.getRemainingRequests(config);
      const resetTime = this.rateLimiterService.getResetTime(config);
      
      throw new HttpException(
        {
          message: rateLimitOptions.message,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          remaining,
          resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private generateKey(request: Request, type: RateLimitType): string {
    switch (type) {
      case RateLimitType.IP:
        return `rate_limit:ip:${request.ip}`;
      case RateLimitType.USER:
        const userId = (request as any).user?.id || 'anonymous';
        return `rate_limit:user:${userId}`;
      case RateLimitType.GLOBAL:
        return 'rate_limit:global';
      default:
        return `rate_limit:ip:${request.ip}`;
    }
  }
}