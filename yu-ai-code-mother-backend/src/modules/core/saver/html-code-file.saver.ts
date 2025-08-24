import { Injectable } from '@nestjs/common';
import { CodeFileSaverTemplate, FileDirectory } from './code-file-saver.template';
import { HtmlCodeResult } from '../parser/html-code.parser';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';

/**
 * HTML代码文件保存器
 * 对齐 Java 版本的 HtmlCodeFileSaverTemplate
 */
@Injectable()
export class HtmlCodeFileSaver extends CodeFileSaverTemplate<HtmlCodeResult> {
  
  protected getCodeType(): string {
    return CodeGenTypeEnum.HTML;
  }

  protected saveFiles(result: HtmlCodeResult, baseDirPath: string): void {
    this.writeToFile(baseDirPath, 'index.html', result.htmlCode);
  }

  protected validateInput(result: HtmlCodeResult): void {
    super.validateInput(result);
    // HTML 代码不能为空
    if (!result.htmlCode || !result.htmlCode.trim()) {
      throw new Error('HTML 代码不能为空');
    }
  }

  /**
   * 静态方法，保持向后兼容
   */
  static async saveHtmlCodeResult(
    htmlCodeResult: HtmlCodeResult,
    appId: number,
  ): Promise<{ getAbsolutePath: () => string }> {
    const saver = new HtmlCodeFileSaver();
    const fileDirectory = saver.saveCode(htmlCodeResult, appId);
    
    return {
      getAbsolutePath: () => fileDirectory.getAbsolutePath(),
    };
  }
}