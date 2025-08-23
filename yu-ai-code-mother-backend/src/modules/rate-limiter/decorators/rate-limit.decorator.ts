import { SetMetadata } from '@nestjs/common';
import { RateLimitType } from '../enums/rate-limit-type.enum';

export interface RateLimitOptions {
  limit: number;
  window: number; // 时间窗口（秒）
  type?: RateLimitType;
  message?: string;
}

export const RATE_LIMIT_KEY = 'rate_limit';

export const RateLimit = (options: RateLimitOptions) => {
  return SetMetadata(RATE_LIMIT_KEY, {
    limit: options.limit,
    window: options.window,
    type: options.type || RateLimitType.IP,
    message: options.message || '请求过于频繁，请稍后再试',
  });
};