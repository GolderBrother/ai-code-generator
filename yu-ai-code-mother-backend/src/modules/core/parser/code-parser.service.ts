import { Injectable, Logger } from '@nestjs/common';
import { CodeParserInterface, ParseResult, CodeStructure, ImportInfo, ExportInfo, FunctionInfo, VariableInfo } from './code-parser.interface';

/**
 * 代码解析服务
 * 对齐Java版本的代码解析功能
 */
@Injectable()
export class CodeParserService implements CodeParserInterface {
  private readonly logger = new Logger(CodeParserService.name);

  /**
   * 解析代码
   */
  async parse(code: string): Promise<ParseResult> {
    try {
      const structure = await this.extractStructure(code);
      const dependencies = this.extractDependencies(code);
      
      return {
        success: true,
        errors: [],
        warnings: [],
        structure,
        dependencies,
      };
    } catch (error) {
      this.logger.error('代码解析失败:', error);
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        structure: this.getEmptyStructure(),
        dependencies: [],
      };
    }
  }

  /**
   * 验证代码
   */
  async validate(code: string): Promise<boolean> {
    try {
      const result = await this.parse(code);
      return result.success && result.errors.length === 0;
    } catch (error) {
      this.logger.error('代码验证失败:', error);
      return false;
    }
  }

  /**
   * 提取代码结构
   */
  async extractStructure(code: string): Promise<CodeStructure> {
    const type = this.detectCodeType(code);
    
    return {
      type: type as 'html' | 'vue' | 'react' | 'nodejs' | 'unknown',
      components: [],
      imports: this.extractImports(code),
      exports: this.extractExports(code),
      functions: this.extractFunctions(code),
      variables: this.extractVariables(code),
    };
  }

  /**
   * 检测代码类型
   */
  private detectCodeType(code: string): 'html' | 'vue' | 'react' | 'nodejs' | 'unknown' {
    if (code.includes('<template>') || code.includes('<script>')) {
      return 'vue';
    }
    if (code.includes('import React') || code.includes('from "react"')) {
      return 'react';
    }
    if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
      return 'html';
    }
    if (code.includes('require(') || code.includes('module.exports')) {
      return 'nodejs';
    }
    return 'unknown';
  }

  /**
   * 提取导入信息
   */
  private extractImports(code: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importStr = match[1].trim();
      const module = match[2];
      
      imports.push({
        module,
        imports: [importStr],
        isDefault: !importStr.includes('{'),
      });
    }

    return imports;
  }

  /**
   * 提取导出信息
   */
  private extractExports(code: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    const exportRegex = /export\s+(default\s+)?(.+)/g;
    let match;

    while ((match = exportRegex.exec(code)) !== null) {
      const isDefault = !!match[1];
      const name = match[2].trim();
      
      exports.push({
        name,
        type: isDefault ? 'default' : 'named',
      });
    }

    return exports;
  }

  /**
   * 提取函数信息
   */
  private extractFunctions(code: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      const name = match[1];
      const params = match[2].split(',').map(p => ({
        name: p.trim(),
        optional: false,
      }));
      
      functions.push({
        name,
        parameters: params,
        isAsync: false,
      });
    }

    return functions;
  }

  /**
   * 提取变量信息
   */
  private extractVariables(code: string): VariableInfo[] {
    const variables: VariableInfo[] = [];
    const varRegex = /(const|let|var)\s+(\w+)/g;
    let match;

    while ((match = varRegex.exec(code)) !== null) {
      const isConst = match[1] === 'const';
      const name = match[2];
      
      variables.push({
        name,
        isConst,
      });
    }

    return variables;
  }

  /**
   * 提取依赖
   */
  private extractDependencies(code: string): string[] {
    const dependencies: string[] = [];
    const importRegex = /from\s+['"](.+?)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        dependencies.push(dep);
      }
    }

    return [...new Set(dependencies)];
  }

  /**
   * 获取空结构
   */
  private getEmptyStructure(): CodeStructure {
    return {
      type: 'unknown',
      components: [],
      imports: [],
      exports: [],
      functions: [],
      variables: [],
    };
  }
}