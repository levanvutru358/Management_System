import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service'; // Thêm UsersService
import * as nodemailer from 'nodemailer';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService, // Inject UsersService
  ) {}

  async syncCalendar(taskId: number) {
    const task = await this.tasksService.findOne(taskId);
    console.log(`Syncing task "${task.title}" to Google Calendar`);
    return { message: 'Task synced to calendar' };
  }

  async sendEmailReminder(taskId: number) {
    const task = await this.tasksService.findOne(taskId);

    // Lấy email của user liên quan (ví dụ: người được gán task)
    let recipientEmail = 'recipient@example.com'; // Giá trị mặc định
    if (task.assignedUserId) {
      const assignedUser = await this.usersService.findById(task.assignedUserId);
      recipientEmail = assignedUser.email;
    } else if (task.userId) {
      const creator = await this.usersService.findById(task.userId);
      recipientEmail = creator.email;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail, // Sử dụng email lấy từ user
      subject: `Reminder: Task "${task.title}"`,
      text: `Task "${task.title}" is due on ${task.dueDate}.`,
    };

    await transporter.sendMail(mailOptions);
    return { message: 'Email reminder sent' };
  }
}