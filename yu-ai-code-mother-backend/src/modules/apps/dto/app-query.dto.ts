import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AppQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  current: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageNum?: number;

  /**
   * id
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  /**
   * 应用名称
   */
  @IsOptional()
  @IsString()
  appName?: string;

  /**
   * 应用封面
   */
  @IsOptional()
  @IsString()
  cover?: string;

  /**
   * 应用初始化的 prompt
   */
  @IsOptional()
  @IsString()
  initPrompt?: string;

  /**
   * 代码生成类型（枚举）
   */
  @IsOptional()
  @IsString()
  codeGenType?: string;

  /**
   * 部署标识
   */
  @IsOptional()
  @IsString()
  deployKey?: string;

  /**
   * 优先级
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priority?: number;

  /**
   * 创建用户id
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;


  /**
   * 排序字段
   */
  @IsOptional()
  @IsString()
  sortField?: string;

  /**
   * 排序顺序
   */
  @IsOptional()
  @IsString()
  sortOrder?: string;
}
