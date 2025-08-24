import { Injectable } from '@nestjs/common';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';
import { HtmlCodeFileSaver } from './html-code-file.saver';
import { MultiFileCodeFileSaver } from './multi-file-code-file.saver';
import { VueProjectFileSaver } from './vue-project-file.saver';
import { FileDirectory } from './code-file-saver.template';
import { HtmlCodeResult } from '../parser/html-code.parser';
import { MultiFileCodeResult } from '../parser/multi-file-code.parser';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 代码文件保存执行器
 * 根据代码生成类型执行相应的保存逻辑
 * 完全对齐 Java 版本的 CodeFileSaver 功能
 */
@Injectable()
export class CodeFileSaverExecutor {
  private readonly htmlCodeFileSaver = new HtmlCodeFileSaver();
  private readonly multiFileCodeFileSaver = new MultiFileCodeFileSaver();
  private readonly vueProjectFileSaver = new VueProjectFileSaver();

  // 文件保存的根目录 - 对齐 Java 版本的 FILE_SAVE_ROOT_DIR
  private static readonly FILE_SAVE_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output');

  /**
   * 执行代码保存
   * 完全对齐 Java 版本的 executeSaver 方法
   */
  executeSaver(codeResult: any, codeGenType: CodeGenTypeEnum, appId: number): FileDirectory {
    switch (codeGenType) {
      case CodeGenTypeEnum.HTML:
        return this.htmlCodeFileSaver.saveCode(codeResult as HtmlCodeResult, appId);
      case CodeGenTypeEnum.MULTI_FILE:
        return this.multiFileCodeFileSaver.saveCode(codeResult as MultiFileCodeResult, appId);
      case CodeGenTypeEnum.VUE_PROJECT:
        return this.vueProjectFileSaver.saveCode(codeResult, appId);
      default:
        throw new Error(`不支持的代码生成类型: ${codeGenType}`);
    }
  }

  /**
   * 保存 HTML 网页代码
   * 完全对齐 Java 版本的 CodeFileSaver.saveHtmlCodeResult 方法
   */
  static saveHtmlCodeResult(htmlCodeResult: HtmlCodeResult): { getAbsolutePath: () => string } {
    const baseDirPath = this.buildUniqueDir(CodeGenTypeEnum.HTML);
    this.writeToFile(baseDirPath, 'index.html', htmlCodeResult.htmlCode);
    
    return {
      getAbsolutePath: () => baseDirPath,
    };
  }

  /**
   * 保存多文件网页代码
   * 完全对齐 Java 版本的 CodeFileSaver.saveMultiFileCodeResult 方法
   */
  static saveMultiFileCodeResult(result: MultiFileCodeResult): { getAbsolutePath: () => string } {
    const baseDirPath = this.buildUniqueDir(CodeGenTypeEnum.MULTI_FILE);
    this.writeToFile(baseDirPath, 'index.html', result.htmlCode);
    this.writeToFile(baseDirPath, 'style.css', result.cssCode);
    this.writeToFile(baseDirPath, 'script.js', result.jsCode);
    
    return {
      getAbsolutePath: () => baseDirPath,
    };
  }

  /**
   * 构建文件的唯一路径：output/bizType_appId
   * 完全对齐 Java 版本的 buildUniqueDir 方法
   */
  private static buildUniqueDir(bizType: string, appId?: number): string {
    const uniqueDirName = appId ? `${bizType}_${appId}` : `${bizType}_${Date.now()}`;
    const dirPath = path.join(this.FILE_SAVE_ROOT_DIR, uniqueDirName);
    
    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    return dirPath;
  }

  /**
   * 保存单个文件
   * 完全对齐 Java 版本的 writeToFile 方法
   */
  private static writeToFile(dirPath: string, filename: string, content: string): void {
    const filePath = path.join(dirPath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * 静态方法，保持向后兼容
   */
  static async executeSaver(
    parsedResult: any,
    codeGenType: CodeGenTypeEnum,
    appId: number,
  ): Promise<{ getAbsolutePath: () => string }> {
    const executor = new CodeFileSaverExecutor();
    const fileDirectory = executor.executeSaver(parsedResult, codeGenType, appId);
    
    return {
      getAbsolutePath: () => fileDirectory.getAbsolutePath(),
    };
  }
}
