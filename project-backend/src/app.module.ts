import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';

import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Subtask } from './tasks/entities/subtask.entity';
import { Attachment } from './tasks/entities/attachment.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'TUANPHONG',
      password: '123321',
      database: 'task',
      entities: [User, Task, Subtask, Attachment],
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    ReportsModule,
    IntegrationsModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
