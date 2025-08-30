import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateChatHistoryDto {
  @IsNotEmpty({ message: '应用ID不能为空' })
  @IsNumber({}, { message: '应用ID必须是数字' })
  appId: number;

  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  @MaxLength(8192, { message: '消息内容长度不能超过 8192 个字符' })
  message: string;

  @IsOptional()
  @IsNumber({}, { message: '消息类型必须是数字' })
  messageType?: number;
}