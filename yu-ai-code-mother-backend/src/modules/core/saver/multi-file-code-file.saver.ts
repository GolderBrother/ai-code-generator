import { Injectable } from '@nestjs/common';
import { CodeFileSaverTemplate, FileDirectory } from './code-file-saver.template';
import { MultiFileCodeResult } from '../parser/multi-file-code.parser';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';

/**
 * 多文件代码保存器
 * 对齐 Java 版本的 MultiFileCodeFileSaverTemplate
 */
@Injectable()
export class MultiFileCodeFileSaver extends CodeFileSaverTemplate<MultiFileCodeResult> {
  
  protected getCodeType(): string {
    return CodeGenTypeEnum.MULTI_FILE;
  }

  protected saveFiles(result: MultiFileCodeResult, baseDirPath: string): void {
    // 保存 HTML 文件
    this.writeToFile(baseDirPath, 'index.html', result.htmlCode || '');
    // 保存 CSS 文件
    this.writeToFile(baseDirPath, 'style.css', result.cssCode || '');
    // 保存 JavaScript 文件
    this.writeToFile(baseDirPath, 'script.js', result.jsCode || '');
  }

  protected validateInput(result: MultiFileCodeResult): void {
    super.validateInput(result);
    // 至少要有 HTML 代码，CSS 和 JS 可以为空
    if (!result.htmlCode || !result.htmlCode.trim()) {
      throw new Error('HTML代码内容不能为空');
    }
  }

  /**
   * 静态方法，保持向后兼容
   */
  static async saveMultiFileCodeResult(
    multiFileCodeResult: MultiFileCodeResult,
    appId: number,
  ): Promise<{ getAbsolutePath: () => string }> {
    const saver = new MultiFileCodeFileSaver();
    const fileDirectory = saver.saveCode(multiFileCodeResult, appId);
    
    return {
      getAbsolutePath: () => fileDirectory.getAbsolutePath(),
    };
  }
}