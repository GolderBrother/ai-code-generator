# 核心模块 (Core Module)

本模块参考 Java 版本的 `core` 包，为 NestJS 版本补充了完整的代码生成核心功能。

## 模块结构

```
core/
├── ai-code-generator.facade.ts     # AI 代码生成门面类
├── core.module.ts                  # 核心模块定义
├── builder/
│   └── vue-project.builder.ts      # Vue 项目构建器
├── parser/
│   ├── code-parser.executor.ts     # 代码解析器执行器
│   ├── html-code.parser.ts         # HTML 代码解析器
│   └── multi-file-code.parser.ts   # 多文件代码解析器
└── saver/
    ├── code-file-saver.executor.ts      # 代码文件保存器执行器
    ├── html-code-file.saver.ts          # HTML 文件保存器
    ├── multi-file-code-file.saver.ts    # 多文件保存器
    └── vue-project-file.saver.ts        # Vue 项目文件保存器
```

## 主要功能

### 1. AiCodeGeneratorFacade
- 统一的代码生成入口
- 支持同步和流式代码生成
- 集成解析和保存功能

### 2. 代码解析器 (Parser)
- **HtmlCodeParser**: 解析 HTML 单文件代码
- **MultiFileCodeParser**: 解析多文件代码（HTML + CSS + JS）
- **CodeParserExecutor**: 根据类型选择合适的解析器

### 3. 文件保存器 (Saver)
- **HtmlCodeFileSaver**: 保存 HTML 文件
- **MultiFileCodeFileSaver**: 保存多文件项目
- **VueProjectFileSaver**: 保存 Vue 项目结构
- **CodeFileSaverExecutor**: 统一的保存执行器

### 4. 项目构建器 (Builder)
- **VueProjectBuilder**: Vue 项目构建和依赖安装

## 与 Java 版本的对应关系

| Java 版本 | NestJS 版本 | 功能说明 |
|-----------|-------------|----------|
| `AiCodeGeneratorFacade.java` | `ai-code-generator.facade.ts` | AI 代码生成门面类 |
| `CodeParser.java` | `parser/` 目录 | 代码解析功能 |
| `CodeFileSaver.java` | `saver/` 目录 | 文件保存功能 |
| `VueProjectBuilder.java` | `builder/vue-project.builder.ts` | Vue 项目构建 |

## 使用方式

```typescript
import { AiCodeGeneratorFacade } from './ai-code-generator.facade';
import { CodeGenTypeEnum } from '../../common/enums/code-gen-type.enum';

// 注入服务
constructor(
  private readonly aiCodeGeneratorFacade: AiCodeGeneratorFacade,
) {}

// 生成并保存代码
const saveDir = await this.aiCodeGeneratorFacade.generateAndSaveCode(
  userMessage,
  CodeGenTypeEnum.HTML,
  appId,
);

// 流式生成代码
const codeStream = this.aiCodeGeneratorFacade.generateAndSaveCodeStream(
  userMessage,
  CodeGenTypeEnum.MULTI_FILE,
  appId,
);
```

## 配置说明

### 环境变量
- `CODE_OUTPUT_ROOT_DIR`: 代码输出根目录，默认为 `./output`
- `CODE_DEPLOY_ROOT_DIR`: 代码部署根目录，默认为 `./deploy`

### 支持的代码生成类型
- `HTML`: HTML 单文件
- `MULTI_FILE`: 多文件项目（HTML + CSS + JS）
- `VUE_PROJECT`: Vue 项目

## 特性

1. **模块化设计**: 每个功能独立封装，易于维护和扩展
2. **类型安全**: 完整的 TypeScript 类型定义
3. **错误处理**: 完善的错误处理和日志记录
4. **流式支持**: 支持流式代码生成和实时反馈
5. **构建集成**: 自动构建 Vue 项目并安装依赖

## 扩展指南

### 添加新的代码生成类型
1. 在 `CodeGenTypeEnum` 中添加新类型
2. 创建对应的解析器 `parser/new-type.parser.ts`
3. 创建对应的保存器 `saver/new-type-file.saver.ts`
4. 在执行器中添加对应的处理逻辑

### 添加新的构建器
1. 在 `builder/` 目录下创建新的构建器
2. 实现构建逻辑和依赖管理
3. 在 `AiCodeGeneratorFacade` 中集成构建器