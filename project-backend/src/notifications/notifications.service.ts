import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { TasksService } from '../tasks/tasks.service';

interface CreateNotificationDto {
  userId: number;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly tasksService: TasksService,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: dto.userId },
      message: dto.message,
    });
    return this.notificationRepository.save(notification);
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await this.notificationRepository.update(id, {
      isRead: true,
      readAt: new Date(),
    });
    return this.notificationRepository.findOneBy({ id }) as Promise<Notification>;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendReminders() {
    this.logger.log('Checking for tasks due soon...');
    try {
      const tasks = await this.tasksService.findAllDueSoon();
      for (const task of tasks) {
        const message = `⏰ Reminder: Task "${task.title}" is due on ${task.dueDate}`;
        this.logger.log(`Creating reminder notification: ${message}`);
        await this.create({ userId: task.user.id, message });
      }
    } catch (error) {
      this.logger.error('Error sending reminders:', error);
    }
  }

  async notifyStatusUpdate(taskId: number, userId: number) {
    const task = await this.tasksService.findOne(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    if (task.user.id !== userId) {
      const message = `📝 Task "${task.title}" was updated by user ${userId}`;
      this.logger.log(`Notifying user ${task.user.id}: ${message}`);
      await this.create({ userId: task.user.id, message });
    }
  }
}