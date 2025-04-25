import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../integrations/mail.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string; userId: number }> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Tạo user mới
    const user = await this.usersService.create(createUserDto);

    // Gửi email chào mừng
    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Welcome to Task Management System',
        text: `Hello ${user.name},\n\nYour account has been created successfully! We're excited to have you on board.\n\nBest regards,\nTask Management Team`,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
      // Không throw error vì gửi email thất bại không nên ảnh hưởng đến việc đăng ký
    }

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Tài khoản không hợp lệ hoặc chưa có mật khẩu');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const payload = { sub: user.id, email: user.email, role: user.role || 'user' };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
    console.log('JWT_EXPIRES_IN:', expiresIn);

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
    };
  }

  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async confirmEmail(token: string): Promise<void> {
    throw new Error('Email confirmation not implemented');
  }
}