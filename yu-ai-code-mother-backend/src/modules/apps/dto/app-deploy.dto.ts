import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AppDeployRequest {
  @IsNotEmpty({ message: '应用ID不能为空' })
  @IsNumber({}, { message: '应用ID必须是数字' })
  id: number;
}

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