import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(private readonly tasksService: TasksService) {}

  async getStats(userId: number) {
    return this.tasksService.getStats(userId);
  }

  async getHistory(taskId: number, user: User) {
    const task = await this.tasksService.findOne(taskId, user); 
    const comments = await this.tasksService.getComments(taskId, user); 
    return { task, updates: comments };
  }
}