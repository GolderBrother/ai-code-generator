import { Injectable } from '@nestjs/common';
import { CodeParser } from './code-parser.interface';

/**
 * 多文件代码解析结果
 */
export interface MultiFileCodeResult {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
}

/**
 * 多文件代码解析器（HTML + CSS + JS）
 * 对齐 Java 版本的 MultiFileCodeParser
 */
@Injectable()
export class MultiFileCodeParser implements CodeParser<MultiFileCodeResult> {
  private static readonly HTML_CODE_PATTERN = /```html\s*\n([\s\S]*?)```/gi;
  private static readonly CSS_CODE_PATTERN = /```css\s*\n([\s\S]*?)```/gi;
  private static readonly JS_CODE_PATTERN = /```(?:js|javascript)\s*\n([\s\S]*?)```/gi;

  /**
   * 解析代码内容
   * 对齐 Java 版本的 parseCode 方法
   */
  parseCode(codeContent: string): MultiFileCodeResult {
    const result: MultiFileCodeResult = {};
    
    // 提取各类代码
    const htmlCode = this.extractCodeByPattern(codeContent, MultiFileCodeParser.HTML_CODE_PATTERN);
    const cssCode = this.extractCodeByPattern(codeContent, MultiFileCodeParser.CSS_CODE_PATTERN);
    const jsCode = this.extractCodeByPattern(codeContent, MultiFileCodeParser.JS_CODE_PATTERN);
    
    // 设置HTML代码
    if (htmlCode && htmlCode.trim()) {
      result.htmlCode = htmlCode.trim();
    }
    
    // 设置CSS代码
    if (cssCode && cssCode.trim()) {
      result.cssCode = cssCode.trim();
    }
    
    // 设置JS代码
    if (jsCode && jsCode.trim()) {
      result.jsCode = jsCode.trim();
    }
    
    return result;
  }

  /**
   * 根据正则模式提取代码
   * 对齐 Java 版本的 extractCodeByPattern 方法
   */
  private extractCodeByPattern(content: string, pattern: RegExp): string | null {
    const match = pattern.exec(content);
    if (match) {
      return match[1];
    }
    return null;
  }
}
