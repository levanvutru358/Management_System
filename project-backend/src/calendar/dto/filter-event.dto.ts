import { IsEnum, IsDateString } from 'class-validator';
import { CalendarView } from '../interfaces/calendar-view.enum';

export class FilterEventDto {
  @IsEnum(CalendarView)
  view: CalendarView;

  @IsDateString()
  date: string; // Đổi thành string để đồng bộ với query
}