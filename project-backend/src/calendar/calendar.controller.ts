import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarView } from './interfaces/calendar-view.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: User) {
    return this.calendarService.create(createEventDto, user);
  }

  @Get()
  findAll(
    @Query('view') view: CalendarView = CalendarView.MONTH,
    @Query('date') date: string,
    @GetUser() user: User,
  ) {
    return this.calendarService.findAll(view, date, user);
  }

  @Get('reminders')
  findUpcomingDeadlines(@GetUser() user: User) {
    return this.calendarService.findUpcomingDeadlines(user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.calendarService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(+id);
  }
}