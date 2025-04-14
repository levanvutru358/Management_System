import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';
import { CalendarModule } from './calendar/calendar.module';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Event } from './calendar/entities/event.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Comment } from './tasks/entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
      cache: false,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'tru123',
      password: 'tru12345',
      database: 'task_manager',
      entities: [User, Task, Event, Comment, Notification],
      synchronize: true, 
      timezone: '+07:00',
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    ReportsModule,
    IntegrationsModule,
    AdminModule,
    CalendarModule,
    MailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}