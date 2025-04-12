import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarCron } from './calendar.cron';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    NotificationsModule,
    IntegrationsModule,
    UsersModule
    
  ],
  controllers: [CalendarController],
  providers: [CalendarService, CalendarCron],
  exports: [CalendarService],
})
export class CalendarModule {}