import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { MailService } from './mail.service';

@Module({
  imports: [TasksModule, UsersModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService,MailService],
  exports: [IntegrationsService, MailService], 

})
export class IntegrationsModule {}
