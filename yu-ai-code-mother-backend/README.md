# AI 零代码应用生成平台 - NestJS 后端

这是 AI 零代码应用生成平台的后端服务，使用 NestJS + TypeScript 开发。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- Redis 7.0+
- Docker & Docker Compose (可选)

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量文件并配置：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量：

```env
# 应用配置
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=123456
DATABASE_NAME=yu_ai_code_mother

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# AI 服务配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

### 数据库初始化

确保 MySQL 服务已启动，并创建数据库：

```sql
CREATE DATABASE yu_ai_code_mother CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动应用

#### 开发模式

```bash
npm run start:dev
```

#### 生产模式

```bash
npm run build
npm run start:prod
```

### 使用 Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

## 📁 项目结构

```
src/
├── main.ts                    # 应用入口
├── app.module.ts             # 根模块
├── config/                   # 配置模块
│   ├── database.config.ts    # 数据库配置
│   └── redis.config.ts       # Redis 配置
├── common/                   # 公共模块
│   ├── guards/               # 守卫
│   ├── decorators/           # 装饰器
│   ├── interceptors/         # 拦截器
│   ├── filters/              # 过滤器
│   └── health/               # 健康检查
├── modules/                  # 业务模块
│   ├── users/                # 用户模块
│   ├── apps/                 # 应用模块
│   ├── ai/                   # AI 服务模块
│   └── chat/                 # 聊天模块
└── utils/                    # 工具模块
```

## 🔧 主要功能

### 用户管理
- 用户注册、登录、认证
- 角色权限管理
- JWT Token 认证

### 应用管理
- 应用创建、编辑、删除
- 应用状态管理
- 应用部署

### AI 代码生成
- 基于 LangChain.js 的 AI 服务
- 支持多种代码生成类型
- 工具调用机制

### 聊天系统
- 实时对话
- 流式响应
- 聊天历史记录

## 🛠️ 开发指南

### 添加新模块

```bash
# 使用 NestJS CLI 生成模块
nest generate module modules/example
nest generate controller modules/example
nest generate service modules/example
```

### 添加新实体

```bash
nest generate entity modules/example/entities/example
```

### 运行测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e
```

### 代码格式化

```bash
# 格式化代码
npm run format

# 代码检查
npm run lint
```

## 📊 API 文档

启动应用后，访问以下地址查看 API 文档：

- Swagger UI: `http://localhost:3000/api/docs`
- 健康检查: `http://localhost:3000/api/health`

## 🔒 安全特性

- JWT 认证
- 角色权限控制
- 请求限流
- 输入验证
- CORS 配置
- Helmet 安全头

## 📈 监控与日志

- Winston 日志记录
- 健康检查端点
- 性能监控
- 错误追踪

## 🚀 部署

### 生产环境部署

1. 配置生产环境变量
2. 构建应用：`npm run build`
3. 使用 PM2 或 Docker 部署

### Docker 部署

```bash
# 构建镜像
docker build -t yu-ai-code-mother-backend .

# 运行容器
docker run -d -p 3000:3000 --name backend yu-ai-code-mother-backend
```

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如果您有任何问题或建议，请：

1. 查看 [Issues](../../issues)
2. 创建新的 Issue
3. 联系开发团队

## 🔄 从 Java 版本迁移

如果您正在从 Java + Spring Boot 版本迁移，请参考：

- [技术迁移方案](../docs/技术迁移方案.md)
- [后端实现详解](../docs/后端实现详解.md)

## 📚 相关文档

- [项目架构文档](../docs/项目架构文档.md)
- [技术架构文档](../docs/技术架构文档.md)
- [产品说明文档](../docs/产品说明文档.md)
- [后端实现详解](../docs/后端实现详解.md)
