import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  async getAllUsers() {
    return this.usersService.findAll();
  }

  async lockUser(id: number) {
    return this.usersService.updateStatus(id, false);
  }

  async unlockUser(id: number) {
    return this.usersService.updateStatus(id, true);
  }

  async getAllTasks() {
    return this.tasksService.findAllSystem();
  }

  async deleteTask(id: number) {
    return this.tasksService.remove(id);
  }
}