import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  userAccount: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  userPassword: string;
}

