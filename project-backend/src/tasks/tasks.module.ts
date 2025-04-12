import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, User]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], 
})
export class TasksModule {}