import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Subtask } from './tasks/entities/subtask.entity';
import { Attachment } from './tasks/entities/attachment.entity'; // Thêm import
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'TUANPHONG',
      password: '123321',
      database: 'manager_system',
      entities: [User, Task, Subtask, Attachment], // Thêm Attachment vào danh sách entities
      synchronize: true,
    }),
    MulterModule.register({
      dest: './uploads', // Thư mục lưu trữ tệp
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
