import { Injectable } from '@nestjs/common';
import { CodeParser } from './code-parser.interface';

/**
 * HTML 代码解析结果
 */
export interface HtmlCodeResult {
  htmlCode: string;
}

/**
 * HTML 单文件代码解析器
 * 对齐 Java 版本的 HtmlCodeParser
 */
@Injectable()
export class HtmlCodeParser implements CodeParser<HtmlCodeResult> {
  private static readonly HTML_CODE_PATTERN = /```html\s*\n([\s\S]*?)```/gi;

  /**
   * 解析代码内容
   * 对齐 Java 版本的 parseCode 方法
   */
  parseCode(codeContent: string): HtmlCodeResult {
    const result: HtmlCodeResult = { htmlCode: '' };
    
    // 提取 HTML 代码
    const htmlCode = this.extractHtmlCode(codeContent);
    if (htmlCode && htmlCode.trim()) {
      result.htmlCode = htmlCode.trim();
    } else {
      // 如果没有找到代码块，将整个内容作为HTML
      result.htmlCode = codeContent.trim();
    }
    
    return result;
  }

  /**
   * 提取 HTML 代码内容
   * 对齐 Java 版本的 extractHtmlCode 方法
   */
  private extractHtmlCode(content: string): string | null {
    const match = HtmlCodeParser.HTML_CODE_PATTERN.exec(content);
    if (match) {
      return match[1];
    }
    return null;
  }
}
