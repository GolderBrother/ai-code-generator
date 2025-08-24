import { Module } from '@nestjs/common';
import { AiCodeGeneratorFacade } from './ai-code-generator.facade';
import { VueProjectBuilder } from './builder/vue-project.builder';
import { CodeParserExecutor } from './parser/code-parser.executor';
import { HtmlCodeParser } from './parser/html-code.parser';
import { MultiFileCodeParser } from './parser/multi-file-code.parser';
import { CodeFileSaverExecutor } from './saver/code-file-saver.executor';
import { HtmlCodeFileSaver } from './saver/html-code-file.saver';
import { MultiFileCodeFileSaver } from './saver/multi-file-code-file.saver';
import { VueProjectFileSaver } from './saver/vue-project-file.saver';
import { AiModule } from '../ai/ai.module.simple';

/**
 * 核心模块
 * 包含代码生成、解析、保存等核心功能
 * 
 * 核心类：
 * - CodeParser -> CodeParserExecutor + HtmlCodeParser + MultiFileCodeParser
 * - CodeFileSaver -> CodeFileSaverExecutor + 各种文件保存器
 * - AiCodeGeneratorFacade -> AiCodeGeneratorFacade（门面模式）
 */
@Module({
  imports: [AiModule],
  providers: [
    // 门面类 - AiCodeGeneratorFacade
    AiCodeGeneratorFacade,
    
    // 构建器 - Vue 项目构建功能
    VueProjectBuilder,
    
    // 解析器 - CodeParser 功能
    CodeParserExecutor,
    HtmlCodeParser,
    MultiFileCodeParser,
    
    // 保存器 - CodeFileSaver 功能
    CodeFileSaverExecutor,
    HtmlCodeFileSaver,
    MultiFileCodeFileSaver,
    VueProjectFileSaver,
  ],
  exports: [
    // 主要门面类，提供统一的代码生成入口
    AiCodeGeneratorFacade,
    
    // 项目构建器
    VueProjectBuilder,
    
    // 代码解析执行器 - 提供静态方法支持
    CodeParserExecutor,
    
    // 文件保存执行器 - 提供静态方法支持
    CodeFileSaverExecutor,
    
    // 导出各个解析器，支持直接使用
    HtmlCodeParser,
    MultiFileCodeParser,
    
    // 导出各个保存器，支持直接使用
    HtmlCodeFileSaver,
    MultiFileCodeFileSaver,
    VueProjectFileSaver,
  ],
})
export class CoreModule {}
