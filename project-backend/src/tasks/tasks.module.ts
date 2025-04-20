import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { Subtask } from './entities/subtask.entity';
import { Attachment } from './entities/attachment.entity';
import { ConfigModule } from '@nestjs/config'; // ✅ Import thêm ConfigModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, Subtask, Attachment]),
    ConfigModule, // ✅ Thêm dòng này để dùng được ConfigService
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
