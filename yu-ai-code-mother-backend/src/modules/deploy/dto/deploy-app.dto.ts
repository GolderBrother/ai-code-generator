import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 部署应用DTO
 */
export class DeployAppDto {
  @IsNumber()
  @IsNotEmpty()
  appId: number;

  @IsString()
  @IsOptional()
  deployPath?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;
}

/**
 * 部署状态查询DTO
 */
export class DeployStatusDto {
  @IsNumber()
  @IsNotEmpty()
  deployId: number;
}