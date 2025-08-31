import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // 获取环境变量或使用默认值
    const host = this.configService.get("DATABASE_HOST", "127.0.0.1");
    const port = this.configService.get("DATABASE_PORT", 3306);
    const username = this.configService.get("DATABASE_USERNAME", "root");
    const password = this.configService.get("DATABASE_PASSWORD", "root");
    const database = this.configService.get(
      "DATABASE_NAME",
      "yu_ai_code_mother"
    );
    const isDevelopment = this.configService.get("NODE_ENV") === "development";

    // 打印数据库连接信息，便于调试
    this.logger.log(
      `数据库连接信息: ${host}:${port}, 用户: ${username}, 数据库: ${database}`
    );

    return {
      type: "mysql",
      host,
      port,
      username,
      password,
      database,
      // synchronize: isDevelopment, // 开发环境启用同步
      synchronize: false, // 如果仍有问题可以禁用
      dropSchema: false, // 不删除现有数据
      logging: isDevelopment,
      charset: "utf8mb4",
      timezone: "+08:00",
      retryAttempts: 3, // 重试次数
      retryDelay: 3000, // 重试延迟
      autoLoadEntities: true,
      // 添加额外的连接选项，解决主机访问权限问题
      connectTimeout: 60000,
      keepConnectionAlive: true, // 保持连接活跃
      extra: {
        connectionLimit: 10,
        enableKeepAlive: true, // 启用保持连接
        keepAliveInitialDelay: 10000, // 保持连接初始延迟
      },
      // 添加错误处理
      ssl: false, // 禁用SSL
    };
  }
}