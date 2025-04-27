import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { UsersModule } from '../users/users.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, ActivityLog]), 
    UsersModule,
    forwardRef(() => ActivityLogsModule),
  ],
  controllers: [TasksController],
  providers: [TasksService], 
  exports: [TasksService],
})
export class TasksModule {}