import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // 如果已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'code' in data) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }
        
        // 转换为标准格式
        return {
          code: 0,
          data,
          message: '操作成功',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

