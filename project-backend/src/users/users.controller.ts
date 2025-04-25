import { Controller, Get, Put, Body, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@GetUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get()
  getAllUsers(@GetUser() user: User) {
    // Chỉ admin mới được truy cập danh sách người dùng
    // if (user.role !== 'admin') {
    //   throw new ForbiddenException('Only admins can access this resource');
    // }
    return this.usersService.findAll();
  }

  @Get(':id')
  getOneUserById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Put('me')
  updateProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }
}