import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
})
export class TasksModule {}
