import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarService } from './calendar.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../integrations/mail.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service'; 

@Injectable()
export class CalendarCron {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService, 
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleDeadlineReminders() {
    const users = await this.getUsers();
    for (const user of users) {
      const events = await this.calendarService.findUpcomingDeadlines(user);
      for (const event of events) {
        // Gửi thông báo trong hệ thống
        await this.notificationsService.create({
          userId: user.id,
          message: `📅 Reminder: Event "${event.title}" is nearing its deadline at ${event.deadline}`,
        });

        // Gửi email nhắc nhở
        await this.mailService.sendMail({
          to: user.email,
          subject: `⏰ Reminder: ${event.title} Deadline Approaching`,
          text: `Dear ${user.name},\n\nThe event "${event.title}" has a deadline at ${event.deadline}.\n\nBest regards,\nManagement System`,
        });
      }
    }
  }

  private async getUsers(): Promise<User[]> {
    return this.usersService.findAll(); 
  }
}
