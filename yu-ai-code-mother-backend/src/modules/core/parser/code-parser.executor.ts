import { Injectable } from '@nestjs/common';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';
import { HtmlCodeParser, HtmlCodeResult } from './html-code.parser';
import { MultiFileCodeParser, MultiFileCodeResult } from './multi-file-code.parser';

/**
 * 代码解析执行器
 * 根据代码生成类型执行相应的解析逻辑
 * 完全对齐 Java 版本的 CodeParser 功能
 */
@Injectable()
export class CodeParserExecutor {
  private readonly htmlCodeParser = new HtmlCodeParser();
  private readonly multiFileCodeParser = new MultiFileCodeParser();

  /**
   * 执行代码解析
   * 完全对齐 Java 版本的 CodeParser.parseHtmlCode 和 parseMultiFileCode 方法
   */
  executeParser(codeContent: string, codeGenTypeEnum: CodeGenTypeEnum): HtmlCodeResult | MultiFileCodeResult | any {
    switch (codeGenTypeEnum) {
      case CodeGenTypeEnum.HTML:
        // 对齐 Java 版本的 CodeParser.parseHtmlCode 方法
        return this.htmlCodeParser.parseCode(codeContent);
      case CodeGenTypeEnum.MULTI_FILE:
        // 对齐 Java 版本的 CodeParser.parseMultiFileCode 方法
        return this.multiFileCodeParser.parseCode(codeContent);
      case CodeGenTypeEnum.VUE_PROJECT:
        // Vue 项目通常不需要解析，直接返回原始内容
        return { projectContent: codeContent };
      default:
        throw new Error(`不支持的代码生成类型：${codeGenTypeEnum}`);
    }
  }

  /**
   * 静态方法，保持向后兼容
   * 对齐 Java 版本的静态方法调用方式
   */
  static executeParser(codeContent: string, codeGenType: CodeGenTypeEnum): any {
    const executor = new CodeParserExecutor();
    return executor.executeParser(codeContent, codeGenType);
  }

  /**
   * 解析 HTML 单文件代码
   * 完全对齐 Java 版本的 CodeParser.parseHtmlCode 方法
   */
  static parseHtmlCode(codeContent: string): HtmlCodeResult {
    const parser = new HtmlCodeParser();
    return parser.parseCode(codeContent);
  }

  /**
   * 解析多文件代码（HTML + CSS + JS）
   * 完全对齐 Java 版本的 CodeParser.parseMultiFileCode 方法
   */
  static parseMultiFileCode(codeContent: string): MultiFileCodeResult {
    const parser = new MultiFileCodeParser();
    return parser.parseCode(codeContent);
  }
}
