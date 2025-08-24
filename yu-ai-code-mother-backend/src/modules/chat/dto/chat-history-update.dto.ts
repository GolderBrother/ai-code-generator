import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ChatHistoryUpdateDto {
  @IsOptional()
  @IsString({ message: '消息内容必须是字符串' })
  messageContent?: string;

  @IsOptional()
  @IsNumber({}, { message: '消息类型必须是数字' })
  messageType?: number;
}