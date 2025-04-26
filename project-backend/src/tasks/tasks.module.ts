import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity'; // Kiểm tra đường dẫn và khai báo entity Task
import { Comment } from './entities/comment.entity'; // Kiểm tra đường dẫn và khai báo entity Comment
import { TasksGateway } from './tasks.gateway';



@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment])], // Đảm bảo rằng Task và Comment đúng
  controllers: [TasksController],
  providers: [TasksService, TasksGateway],
  exports: [TasksService], // Export service nếu cần
})
export class TasksModule {}
