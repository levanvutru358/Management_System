import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarCron } from './calendar.cron';
import { Event } from './entities/event.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    NotificationsModule,
    IntegrationsModule,
    UsersModule,
    MailModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService, CalendarCron],
  exports: [CalendarService],
})
export class CalendarModule {}
