import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      console.log('UsersRepository before findOneBy:', this.usersRepository);
      console.log('Finding user with email:', email);
      const user = await this.usersRepository.findOneBy({ email });
      console.log('Found user:', user);
      return user || undefined; // Chuyển null thành undefined
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