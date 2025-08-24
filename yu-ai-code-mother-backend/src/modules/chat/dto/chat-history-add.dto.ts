import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class ChatHistoryAddDto {
  @IsNotEmpty({ message: '应用 id 不能为空' })
  @IsNumber({}, { message: '应用 id 必须是数字' })
  appId: number;

  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  messageContent: string;

  @IsOptional()
  @IsNumber({}, { message: '消息类型必须是数字' })
  messageType?: number; // 0-用户，1-AI
}