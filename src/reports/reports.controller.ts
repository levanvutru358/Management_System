import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('stats')
  getStats(@GetUser() user: User) {
    return this.reportsService.getStats(user.id);
  }

  @Get('history/:taskId')
  getHistory(@Param('taskId', ParseIntPipe) taskId: number, @GetUser() user: User) {
    return this.reportsService.getHistory(taskId, user); // Truyền user vào getHistory
  }
}