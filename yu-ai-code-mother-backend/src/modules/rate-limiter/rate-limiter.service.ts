import { Injectable } from '@nestjs/common';
import { RateLimitType } from './enums/rate-limit-type.enum';

export interface RateLimitConfig {
  key: string;
  limit: number;
  window: number; // 时间窗口（秒）
  type: RateLimitType;
}

@Injectable()
export class RateLimiterService {
  private requests: Map<string, number[]> = new Map();

  /**
   * 检查是否超过限流
   */
  async checkRateLimit(config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.window * 1000;
    
    // 获取当前key的请求记录
    const requests = this.requests.get(config.key) || [];
    
    // 清理过期的请求记录
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // 检查是否超过限制
    if (validRequests.length >= config.limit) {
      return false; // 超过限制
    }
    
    // 记录当前请求
    validRequests.push(now);
    this.requests.set(config.key, validRequests);
    
    return true; // 未超过限制
  }

  /**
   * 获取剩余请求次数
   */
  getRemainingRequests(config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.window * 1000;
    
    const requests = this.requests.get(config.key) || [];
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, config.limit - validRequests.length);
  }

  /**
   * 获取重置时间
   */
  getResetTime(config: RateLimitConfig): number {
    const requests = this.requests.get(config.key) || [];
    if (requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + config.window * 1000;
  }

  /**
   * 清理过期数据
   */
  cleanup(): void {
    const now = Date.now();
    const maxWindow = 3600 * 1000; // 1小时
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > now - maxWindow);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}