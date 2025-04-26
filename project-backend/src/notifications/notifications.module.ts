import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [TasksModule],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
