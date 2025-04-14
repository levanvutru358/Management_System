import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarView } from './interfaces/calendar-view.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: User) {
    this.logger.log(`Tạo sự kiện: ${JSON.stringify(createEventDto)} cho user ${user.email}`);
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
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User,
  ) {
    return this.calendarService.update(+id, updateEventDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.remove(+id, user);
  }
}