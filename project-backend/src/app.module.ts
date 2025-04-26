import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { MailerModule } from '@nestjs-modules/mailer';
import { TeamsModule } from './teams/teams.module';
import { Module } from '@nestjs/common/decorators/modules';
import { Team } from './teams/entities/team.entity';
import { TeamMember } from './teams/entities/team-member.entity';
import { Comment } from './tasks/entities/comment.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'khoahuy04102004',
      database: 'task_manager',
      entities: [User, Task, Subtask, Attachment, Team, TeamMember, Comment],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'huykhoanguyen0@gmail.com',
          pass: 'qmbyyjpbyigfwqph', 
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    ReportsModule,
    IntegrationsModule,
    AdminModule,
    TeamsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
