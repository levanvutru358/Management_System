import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { Module } from '@nestjs/common/decorators/modules';

@Module({
  imports: [UsersModule, TasksModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
