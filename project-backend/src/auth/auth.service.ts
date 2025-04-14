import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // Thêm ConfigService
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailConfirmed: false, // Thêm thuộc tính xác nhận email
    });

    // Tạo token xác nhận email
    const token = this.jwtService.sign(
      { email: newUser.email, id: newUser.id },
      { expiresIn: '24h' }, // Token hết hạn sau 24 giờ
    );
    const confirmationUrl = `http://localhost:3000/auth/confirm?token=${token}`;

    // Gửi email xác nhận
    await this.mailService.sendMail({
      to: email,
      subject: 'Xác nhận email của bạn',
      text: `Vui lòng xác nhận email bằng cách nhấp vào đây: ${confirmationUrl}`,
    });

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận.',
      userId: newUser.id,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    // Tạm thời bỏ qua bước kiểm tra xác nhận email trong môi trường phát triển
    // if (!user.isEmailConfirmed) {
    //   throw new UnauthorizedException('Email chưa được xác nhận. Vui lòng kiểm tra email để xác nhận.');
    // }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d'; // Đọc từ .env, mặc định 1 ngày
    console.log('JWT_EXPIRES_IN:', expiresIn); // Thêm log để kiểm tra
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
    };
  }

  async confirmEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      if (user.isEmailConfirmed) {
        return { message: 'Email đã được xác nhận trước đó' };
      }

      user.isEmailConfirmed = true;
      await this.usersService.update(user.id, user);
      return { message: 'Email đã được xác nhận thành công' };
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}