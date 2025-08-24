import { PartialType } from '@nestjs/mapped-types';
import { CreateAppDto } from './create-app.dto';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 更新应用请求
 */
export class UpdateAppDto extends PartialType(CreateAppDto) {
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
  appName?: string;
}
