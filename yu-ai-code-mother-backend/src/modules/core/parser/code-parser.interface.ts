/**
 * 代码解析器策略接口
 * 对齐 Java 版本的 CodeParser 接口
 */
export interface CodeParser<T> {
  /**
   * 解析代码内容
   * 
   * @param codeContent 原始代码内容
   * @return 解析后的结果对象
   */
  parseCode(codeContent: string): T;
}

/**
 * 代码解析器接口
 */
export interface CodeParserInterface {
  parse(code: string): Promise<ParseResult>;
  validate(code: string): Promise<boolean>;
  extractStructure(code: string): Promise<CodeStructure>;
}

/**
 * 解析结果
 */
export interface ParseResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  structure: CodeStructure;
  dependencies: string[];
}

/**
 * 代码结构
 */
export interface CodeStructure {
  type: 'html' | 'vue' | 'react' | 'nodejs' | 'unknown';
  components: ComponentInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  variables: VariableInfo[];
}

/**
 * 组件信息
 */
export interface ComponentInfo {
  name: string;
  type: string;
  props: string[];
  methods: string[];
  lifecycle: string[];
}

/**
 * 导入信息
 */
export interface ImportInfo {
  module: string;
  imports: string[];
  isDefault: boolean;
}

/**
 * 导出信息
 */
export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  value?: any;
}

/**
 * 函数信息
 */
export interface FunctionInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType?: string;
  isAsync: boolean;
}

/**
 * 参数信息
 */
export interface ParameterInfo {
  name: string;
  type?: string;
  optional: boolean;
  defaultValue?: any;
}

/**
 * 变量信息
 */
export interface VariableInfo {
  name: string;
  type?: string;
  value?: any;
  isConst: boolean;
}