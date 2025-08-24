import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

/**
 * 应用创建请求
 */
export class CreateAppDto {
  /**
   * 应用初始化的 prompt
   */
  @IsString()
  @MaxLength(8192)
  initPrompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  appName?: string;


  @IsOptional()
  @IsString()
  @MaxLength(128)
  codeGenType?: string;
}
