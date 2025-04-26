// backend/src/users/users.service.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; // Thêm bcrypt
import { Injectable } from '@nestjs/common/decorators/core';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    if (!this.usersRepository) {
      throw new Error('UsersRepository not initialized');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role } = createUserDto;

    // Kiểm tra email đã tồn tại
    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới với mật khẩu đã hash và role mặc định
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, // Lưu mật khẩu đã hash
      role: role || 'user', // Mặc định là 'user'
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      console.log('Finding user with email:', email);
      const user = await this.usersRepository.findOneBy({ email });
      console.log('Found user:', user);
      return user || undefined;
    } catch (error) {
      console.error('Error in findByEmail:', error.message);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateStatus(id: number, status: boolean): Promise<User> {
    await this.usersRepository.update(id, { isActive: status });
    return this.findById(id);
  }
}