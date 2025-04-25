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
  ParseIntPipe,
  Logger,
  Put,
} from '@nestjs/common';
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
  if (!date) {
    this.logger.warn('Thiếu tham số date trong yêu cầu findAll');
    throw new Error('Date parameter is required');
  }
  this.logger.log(`Lấy danh sách sự kiện: view=${view}, date=${date}, user=${user.email}`);
  return this.calendarService.findAll(view, date, user);
}

  @Get('reminders')
  findUpcomingDeadlines(@GetUser() user: User) {
    this.logger.log(`Lấy danh sách sự kiện sắp đến hạn cho user ${user.email}`);
    return this.calendarService.findUpcomingDeadlines(user);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User,
  ) {
    this.logger.log(`Cập nhật sự kiện id=${id} bởi user ${user.email}`);
    return this.calendarService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    this.logger.log(`Xóa sự kiện id=${id} bởi user ${user.email}`);
    return this.calendarService.remove(id, user);
  }
}