import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly tasksService: TasksService) {}

  @Cron('0 0 * * *')
  async sendReminders() {
    const tasks = await this.tasksService.findAllDueSoon();
    tasks.forEach((task) => {
      console.log(`Reminder: Task "${task.title}" is due on ${task.dueDate}!`);
      // Gửi email hoặc thông báo qua WebSocket ở đây
    });
  }

  async notifyStatusUpdate(taskId: number, userId: number) {
    const task = await this.tasksService.findOne(taskId);
    if (task.assignedUserId && task.assignedUserId !== userId) {
      console.log(`Task "${task.title}" status updated by user ${userId}`);
      // Gửi thông báo cho assignedUserId
    }
  }
}