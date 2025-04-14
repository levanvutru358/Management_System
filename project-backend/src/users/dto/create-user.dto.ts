import { IsString, IsEmail, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải dài ít nhất 6 ký tự' })
  password: string;

  @IsString()
  name: string;

  @IsOptional() // Thuộc tính này là tùy chọn
  @IsBoolean()
  isEmailConfirmed?: boolean;
}