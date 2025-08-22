import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  userName: string;

  @IsString()
  @MinLength(4)
  @MaxLength(50)
  userAccount: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  userPassword: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAvatar?: string;
}

