import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
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
=======
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { Subtask } from './entities/subtask.entity'; // ✅ Thêm nếu thiếu
import { Attachment } from './entities/attachment.entity'; // ✅ Thêm nếu thiếu

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment, Subtask, Attachment])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // ✅ Thêm dòng này để module khác có thể dùng
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
})
export class TasksModule {}
