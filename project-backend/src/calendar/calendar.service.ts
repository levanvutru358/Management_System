import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarView } from './interfaces/calendar-view.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      user,
    });
    return this.eventRepository.save(event);
  }

  async findAll(view: CalendarView, date: string, user: User): Promise<Event[]> {
    const start = new Date(date);
    let end: Date;

    switch (view) {
      case CalendarView.MONTH:
        start.setDate(1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        break;
      case CalendarView.WEEK:
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case CalendarView.DAY:
        end = new Date(start);
        break;
      default:
        throw new Error('Invalid view type');
    }

    return this.eventRepository.find({
      where: {
        user: { id: user.id },
        startDate: Between(start, end),
      },
      relations: ['user'],
    });
  }

  async findUpcomingDeadlines(user: User): Promise<Event[]> {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return this.eventRepository.find({
      where: {
        user: { id: user.id },
        deadline: Between(now, next24Hours),
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event | null> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    await this.eventRepository.update(id, updateEventDto);
    return this.eventRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    await this.eventRepository.delete(id);
  }
}