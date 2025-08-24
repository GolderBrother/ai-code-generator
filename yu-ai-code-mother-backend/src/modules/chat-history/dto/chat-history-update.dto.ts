import { IsOptional, IsString, MaxLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryUpdateDto {
  @IsOptional()
  @IsString({ message: '消息内容必须是字符串' })
  @MaxLength(8192, { message: '消息内容长度不能超过 8192 个字符' })
  messageContent?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '消息类型必须是数字' })
  messageType?: number;

  @IsOptional()
  @IsString({ message: '用户消息必须是字符串' })
  @MaxLength(8192, { message: '用户消息长度不能超过 8192 个字符' })
  userMessage?: string;

  @IsOptional()
  @IsString({ message: 'AI 消息必须是字符串' })
  @MaxLength(8192, { message: 'AI 消息长度不能超过 8192 个字符' })
  aiMessage?: string;

  @IsOptional()
  @IsString({ message: '用户角色必须是字符串' })
  @MaxLength(128, { message: '用户角色长度不能超过 128 个字符' })
  userRole?: string;
}