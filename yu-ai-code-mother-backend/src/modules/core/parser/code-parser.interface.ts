/**
 * 代码解析器策略接口
 * 对齐 Java 版本的 CodeParser 接口
 */
export interface CodeParser<T> {
  /**
   * 解析代码内容
   * 
   * @param codeContent 原始代码内容
   * @return 解析后的结果对象
   */
  parseCode(codeContent: string): T;
}