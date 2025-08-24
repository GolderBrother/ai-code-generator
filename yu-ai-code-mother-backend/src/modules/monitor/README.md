# AI模型监控模块

本模块提供了完整的AI模型监控功能，与Java版本的监控模块一对一对齐实现。

## 功能特性

- ✅ **指标收集**: 记录请求次数、错误次数、Token消耗、响应时间
- ✅ **Prometheus集成**: 提供标准的Prometheus指标格式
- ✅ **上下文管理**: 支持跨请求的监控上下文传递
- ✅ **监听器模式**: 提供事件驱动的监控机制
- ✅ **统计分析**: 提供详细的监控统计信息

## 核心组件

### 1. AiModelMetricsCollector (指标收集器)
对应Java的 `AiModelMetricsCollector`，负责收集和记录各种指标。

```typescript
// 记录请求次数
recordRequest(userId: string, appId: string, modelName: string, status: string)

// 记录错误
recordError(userId: string, appId: string, modelName: string, errorMessage: string)

// 记录Token消耗
recordTokenUsage(userId: string, appId: string, modelName: string, tokenType: string, tokenCount: number)

// 记录响应时间
recordResponseTime(userId: string, appId: string, modelName: string, durationMs: number)
```

### 2. AiModelMonitorListener (监听器)
对应Java的 `AiModelMonitorListener`，提供事件驱动的监控机制。

```typescript
// 请求开始
onRequest(requestId: string, modelName: string, userId?: string, appId?: string)

// 请求成功
onResponse(requestId: string, modelName: string, inputTokens?: number, outputTokens?: number, totalTokens?: number)

// 请求失败
onError(requestId: string, modelName: string, errorMessage: string)
```

### 3. MonitorContext & MonitorContextHolder (上下文管理)
对应Java的 `MonitorContext` 和 `MonitorContextHolder`，管理监控上下文。

```typescript
interface MonitorContext {
  userId: string;
  appId: string;
}

// 设置上下文
MonitorContextHolder.setContext(threadId: string, context: MonitorContext)

// 获取上下文
MonitorContextHolder.getContext(threadId: string)

// 清除上下文
MonitorContextHolder.clearContext(threadId: string)
```

### 4. MonitorService (监控服务)
统一的监控服务入口，提供高级API。

```typescript
// 开始AI模型监控
startAiModelMonitoring(requestId: string, modelName: string, userId?: string, appId?: string)

// 结束AI模型监控
endAiModelMonitoring(requestId: string, success: boolean, inputTokens?: number, outputTokens?: number, totalTokens?: number, error?: string)

// 获取统计信息
getStats()

// 获取Prometheus指标
getPrometheusMetrics()
```

## 使用方式

### 方式1: 使用MonitorService (推荐)

```typescript
@Injectable()
export class YourAiService {
  constructor(private readonly monitorService: MonitorService) {}

  async callAiModel(userId: string, appId: string, modelName: string, prompt: string) {
    const requestId = this.generateRequestId();

    try {
      // 设置监控上下文
      this.monitorService.setMonitorContext(userId, appId, requestId);

      // 开始监控
      this.monitorService.startAiModelMonitoring(requestId, modelName, userId, appId);

      // 调用AI模型
      const response = await this.actualAiModelCall(prompt);
      const { inputTokens, outputTokens, totalTokens } = this.parseTokens(response);

      // 结束监控（成功）
      this.monitorService.endAiModelMonitoring(requestId, true, inputTokens, outputTokens, totalTokens);

      return response;
    } catch (error) {
      // 结束监控（失败）
      this.monitorService.endAiModelMonitoring(requestId, false, undefined, undefined, undefined, error.message);
      throw error;
    }
  }
}
```

### 方式2: 直接使用监听器

```typescript
@Injectable()
export class YourAiService {
  constructor(private readonly aiModelMonitorListener: AiModelMonitorListener) {}

  async callAiModel(userId: string, appId: string, modelName: string, prompt: string) {
    const requestId = this.generateRequestId();

    try {
      // 触发请求开始事件
      this.aiModelMonitorListener.onRequest(requestId, modelName, userId, appId);

      // 调用AI模型
      const response = await this.actualAiModelCall(prompt);
      const { inputTokens, outputTokens, totalTokens } = this.parseTokens(response);

      // 触发响应成功事件
      this.aiModelMonitorListener.onResponse(requestId, modelName, inputTokens, outputTokens, totalTokens);

      return response;
    } catch (error) {
      // 触发错误事件
      this.aiModelMonitorListener.onError(requestId, modelName, error.message);
      throw error;
    }
  }
}
```

## 指标端点

### Prometheus指标
```
GET /metrics
```
返回Prometheus格式的指标数据，包括：
- `ai_model_requests_total`: AI模型总请求次数
- `ai_model_errors_total`: AI模型错误次数
- `ai_model_tokens_total`: AI模型Token消耗总数
- `ai_model_response_duration_seconds`: AI模型响应时间

### 统计信息
```
GET /metrics/stats
```
返回JSON格式的统计信息：
```json
{
  "totalRequests": 1000,
  "successfulRequests": 950,
  "successRate": "95.00%",
  "totalTokens": 50000,
  "totalCost": "$0.500000",
  "averageTokensPerRequest": 50,
  "activeRequests": 5
}
```

## 模块集成

在你的模块中导入监控模块：

```typescript
import { Module } from '@nestjs/common';
import { MonitorModule } from '../monitor/monitor.module';

@Module({
  imports: [MonitorModule],
  // ...
})
export class YourModule {}
```

## 与Java版本的对应关系

| Java类 | NestJS对应 | 功能 |
|--------|------------|------|
| `AiModelMetricsCollector` | `AiModelMetricsCollector` | 指标收集器 |
| `AiModelMonitorListener` | `AiModelMonitorListener` | 监听器 |
| `MonitorContext` | `MonitorContext` | 监控上下文 |
| `MonitorContextHolder` | `MonitorContextHolder` | 上下文持有者 |
| - | `MonitorService` | 统一监控服务 |
| - | `MetricsController` | 指标暴露控制器 |

## 注意事项

1. **依赖安装**: 确保已安装 `prom-client` 依赖
2. **上下文管理**: 在异步操作中注意正确传递requestId
3. **资源清理**: 长时间运行的应用应定期清理监控缓存
4. **错误处理**: 监控代码本身的异常不应影响业务逻辑

## 性能考虑

- 指标缓存避免重复创建Prometheus指标对象
- 异步记录避免阻塞主业务流程
- 内存管理定期清理过期的监控上下文