import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarService } from './calendar.service';
import { MailService } from '../mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class CalendarCron {
  private readonly logger = new Logger(CalendarCron.name);

  constructor(
    private readonly calendarService: CalendarService,
    private readonly mailService: MailService,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // Để test, sau này đổi thành EVERY_DAY_AT_NOON
  async handleDeadlineReminders() {
    this.logger.log('Chạy công việc nhắc nhở lịch...');

    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Lấy trực tiếp các sự kiện sắp đến hạn
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.assignedBy', 'assignedBy')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.user', 'user')
      .where('event.dueDate <= :oneDayLater AND event.dueDate >= :now', { oneDayLater, now })
      .andWhere('event.status = :status', { status: 'pending' })
      .andWhere('event.dueDate IS NOT NULL')
      .getMany();

    this.logger.log(`Tìm thấy ${events.length} sự kiện sắp đến hạn.`);

    if (events.length === 0) {
      this.logger.log('Không có sự kiện nào cần nhắc nhở.');
      return;
    }

    for (const event of events) {
      try {
        // Kiểm tra dueDate trước khi sử dụng
        if (!event.dueDate) {
          this.logger.warn(`Sự kiện "${event.title}" không có dueDate, bỏ qua.`);
          continue;
        }

        // Gửi email cho assignedBy
        if (event.assignedBy && event.assignedBy.email && event.assignedBy.name) {
          await this.mailService.sendMail({
            to: event.assignedBy.email,
            subject: `⏰ Nhắc nhở: Hạn chót của "${event.title}" đang đến gần`,
            text: `Kính gửi ${event.assignedBy.name},\n\nSự kiện "${event.title}" có hạn chót vào ${event.dueDate.toISOString()}.\n\nTrân trọng,\nHệ thống quản lý`,
          });
          this.logger.log(`Gửi email thành công đến ${event.assignedBy.email} cho sự kiện "${event.title}"`);
        } else {
          this.logger.warn(`Không thể gửi email cho assignedBy của sự kiện "${event.title}" vì thiếu thông tin.`);
        }

        // Gửi email cho reminderEmails (nếu có)
        if (event.reminderEmails) {
          let reminderEmails: string[] = [];

          if (typeof event.reminderEmails === 'string') {
            try {
              reminderEmails = JSON.parse(event.reminderEmails);
            } catch (parseError) {
              this.logger.warn(`reminderEmails không phải JSON, coi như email đơn: ${event.reminderEmails}`);
              reminderEmails = [event.reminderEmails];
            }
          } else {
            reminderEmails = event.reminderEmails || [];
          }

          if (!Array.isArray(reminderEmails) || reminderEmails.length === 0) {
            this.logger.warn(`Danh sách reminderEmails không hợp lệ cho sự kiện "${event.title}"`);
            continue;
          }

          for (const email of reminderEmails) {
            if (!email || !email.includes('@')) {
              this.logger.warn(`Email không hợp lệ trong reminderEmails: ${email}`);
              continue;
            }

            // Kiểm tra createdBy trước khi sử dụng
            if (!event.createdBy || !event.createdBy.name) {
              this.logger.warn(`Không thể gửi email nhắc nhở cho "${email}" vì thiếu thông tin createdBy.`);
              continue;
            }

            await this.mailService.sendMail({
              to: email,
              subject: `⏰ Nhắc nhở: Sự kiện "${event.title}" của ${event.createdBy.name} sắp đến hạn`,
              text: `Kính gửi,\n\nSự kiện "${event.title}" của ${event.createdBy.name} có hạn chót vào ${event.dueDate.toISOString()}.\n\nTrân trọng,\nHệ thống quản lý`,
            });
            this.logger.log(`Gửi email nhắc nhở thành công đến ${email} cho sự kiện "${event.title}"`);
          }
        }
      } catch (error) {
        this.logger.error(`Lỗi khi xử lý sự kiện "${event.title}": ${error.message}`);
      }
    }
  }
}