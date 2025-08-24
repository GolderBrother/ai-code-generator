/**
 * 监控模块使用示例
 * 展示如何在AI模型调用中集成监控功能
 */

import { Injectable } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { AiModelMonitorListener } from './ai-model-monitor.listener';

@Injectable()
export class AiModelServiceExample {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly aiModelMonitorListener: AiModelMonitorListener,
  ) {}

  /**
   * 示例：调用AI模型并进行监控
   */
  async callAiModel(
    userId: string,
    appId: string,
    modelName: string,
    prompt: string,
  ): Promise<string> {
    const requestId = this.generateRequestId();

    try {
      // 1. 设置监控上下文
      this.monitorService.setMonitorContext(userId, appId, requestId);

      // 2. 开始监控
      this.monitorService.startAiModelMonitoring(requestId, modelName, userId, appId);

      // 3. 模拟AI模型调用
      const response = await this.simulateAiModelCall(prompt);

      // 4. 解析响应中的token信息
      const { content, inputTokens, outputTokens, totalTokens } = this.parseResponse(response);

      // 5. 结束监控（成功）
      this.monitorService.endAiModelMonitoring(
        requestId,
        true, // success
        inputTokens,
        outputTokens,
        totalTokens,
      );

      return content;
    } catch (error) {
      // 6. 结束监控（失败）
      this.monitorService.endAiModelMonitoring(
        requestId,
        false, // success
        undefined, // inputTokens
        undefined, // outputTokens
        undefined, // totalTokens
        error.message, // error
      );

      throw error;
    }
  }

  /**
   * 示例：直接使用监听器进行监控
   */
  async callAiModelWithListener(
    userId: string,
    appId: string,
    modelName: string,
    prompt: string,
  ): Promise<string> {
    const requestId = this.generateRequestId();

    try {
      // 1. 触发请求开始事件
      this.aiModelMonitorListener.onRequest(requestId, modelName, userId, appId);

      // 2. 模拟AI模型调用
      const response = await this.simulateAiModelCall(prompt);

      // 3. 解析响应
      const { content, inputTokens, outputTokens, totalTokens } = this.parseResponse(response);

      // 4. 触发响应成功事件
      this.aiModelMonitorListener.onResponse(
        requestId,
        modelName,
        inputTokens,
        outputTokens,
        totalTokens,
      );

      return content;
    } catch (error) {
      // 5. 触发错误事件
      this.aiModelMonitorListener.onError(requestId, modelName, error.message);
      throw error;
    }
  }

  /**
   * 批量处理示例
   */
  async batchProcessWithMonitoring(
    userId: string,
    appId: string,
    modelName: string,
    prompts: string[],
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < prompts.length; i++) {
      const requestId = `${this.generateRequestId()}_batch_${i}`;
      
      try {
        // 设置监控上下文
        this.aiModelMonitorListener.setMonitorContext(requestId, userId, appId);
        
        // 开始监控
        this.aiModelMonitorListener.onRequest(requestId, modelName, userId, appId);
        
        // 处理单个请求
        const response = await this.simulateAiModelCall(prompts[i]);
        const { content, inputTokens, outputTokens, totalTokens } = this.parseResponse(response);
        
        // 记录成功
        this.aiModelMonitorListener.onResponse(
          requestId,
          modelName,
          inputTokens,
          outputTokens,
          totalTokens,
        );
        
        results.push(content);
      } catch (error) {
        // 记录错误
        this.aiModelMonitorListener.onError(requestId, modelName, error.message);
        results.push(`Error: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * 模拟AI模型调用
   */
  private async simulateAiModelCall(prompt: string): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // 模拟随机失败
    if (Math.random() < 0.1) {
      throw new Error('AI model service unavailable');
    }

    // 模拟响应
    return {
      content: `AI response to: ${prompt}`,
      usage: {
        prompt_tokens: Math.floor(Math.random() * 100) + 50,
        completion_tokens: Math.floor(Math.random() * 200) + 100,
        total_tokens: 0, // 会在parseResponse中计算
      },
    };
  }

  /**
   * 解析AI模型响应
   */
  private parseResponse(response: any): {
    content: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } {
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    return {
      content: response.content,
      inputTokens,
      outputTokens,
      totalTokens,
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}