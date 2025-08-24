import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CodeGenTypeEnum } from '../../../common/enums/code-gen-type.enum';

/**
 * 文件目录包装类，对齐 Java 版本的 File 类
 */
export class FileDirectory {
  constructor(private readonly dirPath: string) {}

  getAbsolutePath(): string {
    return path.resolve(this.dirPath);
  }

  exists(): boolean {
    return fs.existsSync(this.dirPath);
  }
}

/**
 * 抽象代码文件保存器 - 模板方法模式
 * 对齐 Java 版本的 CodeFileSaverTemplate
 */
@Injectable()
export abstract class CodeFileSaverTemplate<T> {
  /**
   * 文件保存的根目录
   */
  private static readonly FILE_SAVE_ROOT_DIR = process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output');

  /**
   * 模板方法：保存代码的标准流程
   * 对齐 Java 版本的 saveCode 方法
   */
  saveCode(result: T, appId: number): FileDirectory {
    // 1. 验证输入
    this.validateInput(result);
    // 2. 构建唯一目录
    const baseDirPath = this.buildUniqueDir(appId);
    // 3. 保存文件（具体实现交给子类）
    this.saveFiles(result, baseDirPath);
    // 4. 返回文件目录对象
    return new FileDirectory(baseDirPath);
  }

  /**
   * 写入单个文件的工具方法
   * 对齐 Java 版本的 writeToFile 方法
   */
  protected writeToFile(dirPath: string, filename: string, content: string): void {
    if (content && content.trim()) {
      const filePath = path.join(dirPath, filename);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  /**
   * 验证输入参数（可由子类覆盖）
   * 对齐 Java 版本的 validateInput 方法
   */
  protected validateInput(result: T): void {
    if (!result) {
      throw new Error('代码结果对象不能为空');
    }
  }

  /**
   * 构建文件的唯一路径
   * 对齐 Java 版本的 buildUniqueDir 方法
   */
  protected buildUniqueDir(appId: number): string {
    if (!appId) {
      throw new Error('应用 ID 不能为空');
    }
    const codeType = this.getCodeType();
    const uniqueDirName = `${codeType}_${appId}`;
    const dirPath = path.join(CodeFileSaverTemplate.FILE_SAVE_ROOT_DIR, uniqueDirName);
    
    // 创建目录
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    return dirPath;
  }

  /**
   * 保存文件（具体实现交给子类）
   * 对齐 Java 版本的 saveFiles 方法
   */
  protected abstract saveFiles(result: T, baseDirPath: string): void;

  /**
   * 获取代码生成类型
   * 对齐 Java 版本的 getCodeType 方法
   */
  protected abstract getCodeType(): string;
}