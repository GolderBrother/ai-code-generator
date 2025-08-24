/**
 * 对话历史消息枚举类型
 */
export enum ChatHistoryMessageTypeEnum {
  USER = 'user',
  AI = 'ai',
}

/**
 * 对话历史消息类型枚举工具类
 */
export class ChatHistoryMessageTypeEnumUtil {
  private static readonly enumMap = new Map([
    [ChatHistoryMessageTypeEnum.USER, '用户'],
    [ChatHistoryMessageTypeEnum.AI, 'AI'],
  ]);

  /**
   * 根据 value 获取枚举
   */
  static getEnumByValue(value: string): ChatHistoryMessageTypeEnum | null {
    if (!value) {
      return null;
    }
    return Object.values(ChatHistoryMessageTypeEnum).find(enumValue => enumValue === value) || null;
  }

  /**
   * 获取枚举描述文本
   */
  static getText(enumValue: ChatHistoryMessageTypeEnum): string {
    return this.enumMap.get(enumValue) || '';
  }

  /**
   * 获取所有枚举值
   */
  static getAllValues(): ChatHistoryMessageTypeEnum[] {
    return Object.values(ChatHistoryMessageTypeEnum);
  }
}