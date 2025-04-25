import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  async syncCalendar(taskId: number) {
    const task = await this.tasksService.findOne(taskId);
    console.log(`Syncing task "${task.title}" to Google Calendar`);
    return { message: 'Task synced to calendar' };
  }

  async sendEmailReminder(taskId: number) {
    const task = await this.tasksService.findOne(taskId);

    let recipientEmail = 'cao101361@donga.edu.vn'; 
    if (task.assignedUserId) {
      const assignedUser = await this.usersService.findById(task.assignedUserId);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }
      recipientEmail = assignedUser.email;
    } else if (task.user) {
      const creator = await this.usersService.findById(task.user.id);
      if (!creator) {
        throw new Error('Creator not found');
      }
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
      to: recipientEmail,
      subject: `Reminder: Task "${task.title}"`,
      text: `Task "${task.title}" is due on ${task.dueDate}.`,
    };

    await transporter.sendMail(mailOptions);
    return { message: 'Email reminder sent' };
  }
}