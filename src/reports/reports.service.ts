import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ReportsService {
  constructor(private readonly tasksService: TasksService) {}

  async getStats(userId: number) {
    return this.tasksService.getStats(userId);
  }

  async getHistory(taskId: number) {
    const task = await this.tasksService.findOne(taskId);
    const comments = await this.tasksService.getComments(taskId);
    return { task, updates: comments };
  }
}