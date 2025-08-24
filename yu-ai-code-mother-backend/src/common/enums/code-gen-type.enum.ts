/**
 * 代码生成类型枚举
 */
export enum CodeGenTypeEnum {
  HTML = 'html',
  MULTI_FILE = 'multi_file',
  VUE_PROJECT = 'vue_project',
}

/**
 * 代码生成类型枚举工具类
 */
export class CodeGenTypeEnumUtil {
  private static readonly enumMap = new Map([
    [CodeGenTypeEnum.HTML, '原生 HTML 模式'],
    [CodeGenTypeEnum.MULTI_FILE, '原生多文件模式'],
    [CodeGenTypeEnum.VUE_PROJECT, 'Vue 工程模式'],
  ]);

  /**
   * 根据 value 获取枚举
   */
  static getEnumByValue(value: string): CodeGenTypeEnum | null {
    if (!value) {
      return null;
    }
    return Object.values(CodeGenTypeEnum).find(enumValue => enumValue === value) || null;
  }

  /**
   * 获取枚举描述文本
   */
  static getText(enumValue: CodeGenTypeEnum): string {
    return this.enumMap.get(enumValue) || '';
  }

  /**
   * 获取所有枚举值
   */
  static getAllValues(): CodeGenTypeEnum[] {
    return Object.values(CodeGenTypeEnum);
  }
}