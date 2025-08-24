/**
 * 代码生成类型枚举
 */
export enum CodeGenTypeEnum {
  HTML = 'html',
  MULTI_FILE = 'multi_file',
  VUE_PROJECT = 'vue_project',
}

/**
 * 代码生成类型描述映射
 */
export const CODE_GEN_TYPE_DESCRIPTIONS = {
  [CodeGenTypeEnum.HTML]: 'HTML单文件',
  [CodeGenTypeEnum.MULTI_FILE]: '多文件项目',
  [CodeGenTypeEnum.VUE_PROJECT]: 'Vue项目',
};