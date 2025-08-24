import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 应用部署请求
 */
export class AppDeployDto {
  /**
   * 应用 id
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  appId: number;
}