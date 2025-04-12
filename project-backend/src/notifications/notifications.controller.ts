import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@GetUser() user: User) {
    return this.notificationsService.findByUser(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Post('status/:taskId')
  notifyStatusUpdate(@Param('taskId') taskId: string, @GetUser() user: User) {
    return this.notificationsService.notifyStatusUpdate(+taskId, user.id);
  }
}
