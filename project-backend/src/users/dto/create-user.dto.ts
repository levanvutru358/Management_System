// users/dto/create-user.dto.ts
import { IsString, IsEmail, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';
}
