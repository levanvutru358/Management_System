// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { User } from '../users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  async lockUser(id: number): Promise<User> {
    return this.usersService.updateStatus(id, false);
  }

  async unlockUser(id: number): Promise<User> {
    return this.usersService.updateStatus(id, true);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasksService.findAllSystem();
  }

  async deleteTask(id: number, user: User): Promise<void> {
    await this.tasksService.remove(id, user);
  }
}
