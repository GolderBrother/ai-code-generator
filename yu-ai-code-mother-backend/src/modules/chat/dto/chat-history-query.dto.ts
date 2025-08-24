import { IsOptional, IsNumber, IsString } from 'class-validator';

export class ChatHistoryQueryDto {
  @IsOptional()
  @IsNumber({}, { message: '应用 id 必须是数字' })
  appId?: number;

  @IsOptional()
  @IsNumber({}, { message: '用户 id 必须是数字' })
  userId?: number;

  @IsOptional()
  @IsString({ message: '消息内容必须是字符串' })
  messageContent?: string;

  @IsOptional()
  @IsNumber({}, { message: '消息类型必须是数字' })
  messageType?: number;

  @IsOptional()
  @IsNumber({}, { message: '当前页码必须是数字' })
  current?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: '页面大小必须是数字' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortField?: string = 'createTime';

  @IsOptional()
  @IsString({ message: '排序顺序必须是字符串' })
  sortOrder?: string = 'desc';
}