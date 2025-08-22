import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateAppDto {
  @IsString()
  @MaxLength(128)
  appName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  appDesc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  appIcon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  appType?: number = 0;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  codeGenType?: string;
}
