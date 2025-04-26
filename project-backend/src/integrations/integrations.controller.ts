import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('calendar/:taskId')
  syncCalendar(@Param('taskId') taskId: string) {
    return this.integrationsService.syncCalendar(+taskId);
  }

  @Post('email/:taskId')
  sendEmailReminder(@Param('taskId') taskId: string) {
    return this.integrationsService.sendEmailReminder(+taskId);
  }
}
