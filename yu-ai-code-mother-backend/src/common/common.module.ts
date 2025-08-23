import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 守卫
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// 策略
import { JwtStrategy } from './strategies/jwt.strategy';

// 装饰器
// import { Roles } from './decorators/roles.decorator';
// import { CurrentUser } from './decorators/current-user.decorator';

// 拦截器
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// 过滤器
import { HttpExceptionFilter } from './filters/http-exception.filter';

// 管道
import { ValidationPipe } from './pipes/validation.pipe';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    TransformInterceptor,
    LoggingInterceptor,
    HttpExceptionFilter,
    ValidationPipe,
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    RolesGuard,
    // Roles,
    // CurrentUser,
    TransformInterceptor,
    LoggingInterceptor,
    HttpExceptionFilter,
    ValidationPipe,
  ],
})
export class CommonModule {}
