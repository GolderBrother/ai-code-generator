import { Injectable, Logger } from '@nestjs/common';
import { AiCodeGeneratorService } from '../ai/ai-code-generator.service';
import { CodeGenTypeEnum } from '../../common/enums/code-gen-type.enum';
import { CodeParserExecutor } from './parser/code-parser.executor';
import { CodeFileSaverExecutor } from './saver/code-file-saver.executor';
import { VueProjectBuilder } from './builder/vue-project.builder';
import { FileDirectory } from './saver/code-file-saver.template';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { HtmlCodeResult } from './parser/html-code.parser';
import { MultiFileCodeResult } from './parser/multi-file-code.parser';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AI 代码生成门面类，组合代码生成和保存功能
 * 完全对齐 Java 版本的 AiCodeGeneratorFacade 功能
 */
@Injectable()
export class AiCodeGeneratorFacade {
  private readonly logger = new Logger(AiCodeGeneratorFacade.name);
  
  constructor(
    private readonly aiCodeGeneratorService: AiCodeGeneratorService,
    private readonly vueProjectBuilder: VueProjectBuilder,
    private readonly codeParserExecutor: CodeParserExecutor,
    private readonly codeFileSaverExecutor: CodeFileSaverExecutor,
  ) {}

  /**
   * 统一入口：根据类型生成并保存代码
   * 完全对齐 Java 版本的 generateAndSaveCode 方法
   */
  async generateAndSaveCode(
    userMessage: string,
    codeGenTypeEnum: CodeGenTypeEnum,
    appId: number,
  ): Promise<FileDirectory> {
    // 参数校验 - 对齐 Java 版本的 ThrowUtils.throwIf
    if (!codeGenTypeEnum) {
      throw new Error('生成类型不能为空');
    }

    try {
      switch (codeGenTypeEnum) {
        case CodeGenTypeEnum.HTML: {
          // 生成 HTML 代码
          const aiResult = await this.aiCodeGeneratorService.generateHtmlCode(userMessage);
          // 解析代码
          const parsedResult = CodeParserExecutor.parseHtmlCode(typeof aiResult === 'string' ? aiResult : aiResult.htmlCode);
          // 保存代码
          const saveResult = CodeFileSaverExecutor.saveHtmlCodeResult(parsedResult);
          return {
            getAbsolutePath: () => saveResult.getAbsolutePath(),
          } as FileDirectory;
        }
        case CodeGenTypeEnum.MULTI_FILE: {
          // 生成多文件代码
          const aiResult = await this.aiCodeGeneratorService.generateMultiFileCode(userMessage);
          // 解析代码
          const parsedResult = CodeParserExecutor.parseMultiFileCode(typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult));
          // 保存代码 - 对齐 Java 版本的 CodeFileSaver.saveMultiFileCodeResult
          const saveResult = CodeFileSaverExecutor.saveMultiFileCodeResult(parsedResult);
          return {
            getAbsolutePath: () => saveResult.getAbsolutePath(),
          } as FileDirectory;
        }
        case CodeGenTypeEnum.VUE_PROJECT: {
          // 生成 Vue 项目代码
          const aiResult = await this.aiCodeGeneratorService.generateVueProjectCode(userMessage);
          // Vue 项目直接保存，不需要解析
          const saveDir = this.codeFileSaverExecutor.executeSaver(aiResult, CodeGenTypeEnum.VUE_PROJECT, appId);
          // 构建 Vue 项目
          await this.vueProjectBuilder.buildProject(saveDir.getAbsolutePath());
          return saveDir;
        }
        default: {
          const errorMessage = `不支持的生成类型：${codeGenTypeEnum}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      this.logger.error(`代码生成失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 统一入口：根据类型生成并保存代码（流式）
   * 完全对齐 Java 版本的 generateAndSaveCodeStream 方法
   */
  generateAndSaveCodeStream(
    userMessage: string,
    codeGenTypeEnum: CodeGenTypeEnum,
    appId: number,
  ): Observable<string> {
    // 参数校验 - 对齐 Java 版本的 ThrowUtils.throwIf
    if (!codeGenTypeEnum) {
      throw new Error('生成类型不能为空');
    }

    switch (codeGenTypeEnum) {
      case CodeGenTypeEnum.HTML: {
        const codeStream = this.aiCodeGeneratorService.generateHtmlCodeStream(userMessage);
        return this.processCodeStream(codeStream, CodeGenTypeEnum.HTML, appId);
      }
      case CodeGenTypeEnum.MULTI_FILE: {
        const codeStream = this.aiCodeGeneratorService.generateMultiFileCodeStream(userMessage);
        return this.processCodeStream(codeStream, CodeGenTypeEnum.MULTI_FILE, appId);
      }
      case CodeGenTypeEnum.VUE_PROJECT: {
        const codeStream = this.aiCodeGeneratorService.generateVueProjectCodeStream(userMessage);
        return this.processVueProjectStream(codeStream, appId);
      }
      default: {
        const errorMessage = `不支持的生成类型：${codeGenTypeEnum}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * 通用流式代码处理方法
   * 完全对齐 Java 版本的流式处理逻辑
   */
  private processCodeStream(
    codeStream: Observable<string>,
    codeGenType: CodeGenTypeEnum,
    appId: number,
  ): Observable<string> {
    const codeBuilder: string[] = [];

    return codeStream.pipe(
      tap(chunk => {
        // 实时收集代码片段
        codeBuilder.push(chunk);
      }),
      finalize(async () => {
        // 流式返回完成后，保存代码
        try {
          const completeCode = codeBuilder.join('');
          
          // 根据类型进行解析和保存 - 对齐 Java 版本的处理逻辑
          if (codeGenType === CodeGenTypeEnum.HTML) {
            const parsedResult = CodeParserExecutor.parseHtmlCode(completeCode);
            const saveResult = CodeFileSaverExecutor.saveHtmlCodeResult(parsedResult);
            this.logger.log(`HTML 代码保存成功，目录为：${saveResult.getAbsolutePath()}`);
          } else if (codeGenType === CodeGenTypeEnum.MULTI_FILE) {
            const parsedResult = CodeParserExecutor.parseMultiFileCode(completeCode);
            const saveResult = CodeFileSaverExecutor.saveMultiFileCodeResult(parsedResult);
            this.logger.log(`多文件代码保存成功，目录为：${saveResult.getAbsolutePath()}`);
          }
        } catch (error) {
          this.logger.error(`保存失败: ${error.message}`, error.stack);
        }
      }),
    );
  }

  /**
   * 处理 Vue 项目流式生成
   * 完全对齐 Java 版本的 Vue 项目处理逻辑
   */
  private processVueProjectStream(
    codeStream: Observable<string>,
    appId: number,
  ): Observable<string> {
    return codeStream.pipe(
      finalize(async () => {
        // Vue 项目构建（同步执行，确保预览时项目已就绪）
        const projectPath = path.join(
          process.env.CODE_OUTPUT_ROOT_DIR || path.join(process.cwd(), 'output'),
          `vue_project_${appId}`
        );
        
        if (fs.existsSync(projectPath)) {
          try {
            await this.vueProjectBuilder.buildProject(projectPath);
            this.logger.log(`Vue 项目构建完成：${projectPath}`);
          } catch (error) {
            this.logger.error(`Vue 项目构建失败: ${error.message}`, error.stack);
          }
        }
      }),
    );
  }
}
