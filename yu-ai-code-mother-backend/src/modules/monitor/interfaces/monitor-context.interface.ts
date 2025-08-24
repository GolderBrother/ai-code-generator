/**
 * 监控上下文接口（对应Java的MonitorContext）
 */
export interface MonitorContext {
  userId: string;
  appId: string;
}

/**
 * 监控上下文持有者（对应Java的MonitorContextHolder）
 */
export class MonitorContextHolder {
  private static contextMap = new Map<string, MonitorContext>();

  /**
   * 设置监控上下文
   */
  static setContext(threadId: string, context: MonitorContext): void {
    this.contextMap.set(threadId, context);
  }

  /**
   * 获取当前监控上下文
   */
  static getContext(threadId: string): MonitorContext | undefined {
    return this.contextMap.get(threadId);
  }

  /**
   * 清除监控上下文
   */
  static clearContext(threadId: string): void {
    this.contextMap.delete(threadId);
  }

  /**
   * 清除所有上下文
   */
  static clearAllContexts(): void {
    this.contextMap.clear();
  }
}