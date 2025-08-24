import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryQueryDto {
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
  appId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  messageType?: number;

  @IsOptional()
  @IsString()
  userMessage?: string;

  @IsOptional()
  @IsString()
  aiMessage?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}
