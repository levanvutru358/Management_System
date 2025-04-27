import { Controller, Get, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('user')
  getUserActivityLogs(@GetUser() user: User) {
    return this.activityLogsService.getUserActivityLogs(user.id);
  }

  @Get('team/:teamId')
  getTeamActivityLogs(@Param('teamId', ParseIntPipe) teamId: number, @GetUser() user: User) {
    return this.activityLogsService.getTeamActivityLogs(teamId, user);
  }
}