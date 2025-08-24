import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 管理员更新应用请求
 */
export class AppAdminUpdateDto {
  /**
   * id
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  /**
   * 应用名称
   */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  appName?: string;

  /**
   * 应用封面
   */
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  cover?: string;

  /**
   * 优先级
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priority?: number;
}