import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly tasksService: TasksService,
    private notificationsGateway: NotificationsGateway
  ) {}

  @Cron('0 7 * * *')
  async sendReminders() {
    const tasks = await this.tasksService.findAllDueSoon();
    tasks.forEach((task) => {
      if(task.assignedUserId) {
        const message = `Reminder: Task "${task.title}" is due on ${task.dueDate}!`
        this.notificationsGateway.sendNotification(`${task.assignedUserId}`, message)
      }
    });
  }

  async notifyTaskAssigned(title: string, name: string) {
    const message = `You are assigned task: ${title}`
    this.notificationsGateway.sendNotification(name, message)
  }

  async notifyTaskStatusUpdate(taskId: number, userId: number) {
    const task = await this.tasksService.findOne(taskId);
    if (task.assignedUserId && task.assignedUserId !== userId) {
      console.log(`Task "${task.title}" status updated by user ${userId}`);
      // Gửi thông báo cho assignedUserId
    }
  }

  async notifyTaskDueSoon(taskId: number, name: string) {
    const task = await this.tasksService.findOne(taskId);
    if (!task) return {message: `Task doesn't exist`};
  
    const message = `Task "${task.title}" is due soon on ${task.dueDate}`;
    this.notificationsGateway.sendNotification(name, message);
  }  
}