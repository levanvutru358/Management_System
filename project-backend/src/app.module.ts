// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { AppController } from './app.controller'; // Thêm import

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Manh22072004',
      database: 'task_manager',
      entities: [User, Task],
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
  controllers: [AppController], // Thêm AppController
})
export class AppModule {}