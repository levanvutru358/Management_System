import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarService } from './calendar.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CalendarCron {
  private readonly logger = new Logger(CalendarCron.name);
  private remindedEvents: Set<string> = new Set();

  constructor(
    private readonly calendarService: CalendarService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE) // Temporary for testing
  async handleDeadlineReminders() {
    const startTime = new Date().toISOString();
    this.logger.log(`Bắt đầu công việc nhắc nhở lịch tại ${startTime}...`);
    try {
      this.logger.log('Tải danh sách người dùng...');
      const users = await this.usersService.findAll();
      this.logger.log(`Tìm thấy ${users.length} người dùng: ${users.map(u => u.email).join(', ')}`);

      for (const user of users) {
        this.logger.log(`Kiểm tra sự kiện cho ${user.email} (ID ${user.id})`);
        const events = await this.calendarService.findUpcomingDeadlines(user);
        this.logger.log(
          `Người dùng ${user.email}: ${events.length} sự kiện - ${JSON.stringify(
            events.map((e) => ({ id: e.id, title: e.title, dueDate: e.dueDate })),
          )}`,
        );

        if (events.length === 0) {
          this.logger.log(`Không có sự kiện nào để nhắc nhở cho ${user.email}`);
          continue;
        }

        for (const event of events) {
          const eventKey = `${user.id}-${event.id}`;
          if (this.remindedEvents.has(eventKey)) {
            this.logger.log(`Sự kiện "${event.title}" (ID ${event.id}) đã được nhắc nhở cho ${user.email}`);
            continue;
          }

          try {
            if (!event.dueDate) {
              this.logger.warn(`Sự kiện "${event.title}" (ID ${event.id}) không có dueDate, bỏ qua`);
              continue;
            }

            this.logger.log(`Tạo thông báo cho sự kiện "${event.title}" (ID ${event.id})`);
            await this.notificationsService.create({
              userId: user.id,
              message: `📅 Nhắc nhở: Sự kiện "${event.title}" sắp đến hạn vào ${event.dueDate.toISOString()}`,
            });

            this.logger.log(`Gửi email cho ${user.email} về sự kiện "${event.title}" (ID ${event.id})`);
            const emailResult = await this.mailService.sendMail({
              to: user.email,
              subject: `⏰ Nhắc nhở: Hạn chót của ${event.title} đang đến gần`,
              text: `Kính gửi ${user.name},\n\nSự kiện "${event.title}" có hạn chót vào ${event.dueDate.toISOString()}.\n\nTrân trọng,\nHệ thống quản lý`,
            });

            if (emailResult.success) {
              this.logger.log(`Email gửi thành công đến ${user.email} cho sự kiện "${event.title}" (ID ${event.id})`);
              this.remindedEvents.add(eventKey);
            } else {
              this.logger.error(`Gửi email thất bại cho ${user.email}: ${emailResult.message}`);
            }
          } catch (error) {
            this.logger.error(
              `Lỗi khi xử lý sự kiện "${event.title}" (ID ${event.id}) cho ${user.email}: ${error.message}`,
              error.stack,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Lỗi trong công việc nhắc nhở: ${error.message}`, error.stack);
    }
    this.logger.log(`Kết thúc công việc nhắc nhở lịch tại ${new Date().toISOString()}`);
  }
}