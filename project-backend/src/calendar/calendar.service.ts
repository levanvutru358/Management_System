import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CalendarView } from './interfaces/calendar-view.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    this.logger.log(`Tạo sự kiện mới: ${JSON.stringify(createEventDto)} cho user ${user?.email || 'unknown'}`);

    if (!user?.id) {
      this.logger.error('User không hợp lệ hoặc thiếu id');
      throw new BadRequestException('User không hợp lệ');
    }

    if (!createEventDto.title || !createEventDto.startDate) {
      this.logger.error('Thiếu title hoặc startDate');
      throw new BadRequestException('Title và startDate là bắt buộc');
    }

    const startDate = new Date(createEventDto.startDate);
    if (isNaN(startDate.getTime())) {
      this.logger.error(`startDate không hợp lệ: ${createEventDto.startDate}`);
      throw new BadRequestException('startDate không hợp lệ');
    }

    let endDate: Date | null = null;
    if (createEventDto.endDate) {
      endDate = new Date(createEventDto.endDate);
      if (isNaN(endDate.getTime())) {
        this.logger.error(`endDate không hợp lệ: ${createEventDto.endDate}`);
        throw new BadRequestException('endDate không hợp lệ');
      }
      if (endDate < startDate) {
        this.logger.error('endDate phải sau startDate');
        throw new BadRequestException('endDate phải sau startDate');
      }
    }

    let dueDate: Date | null = null;
    if (createEventDto.dueDate) {
      dueDate = new Date(createEventDto.dueDate);
      if (isNaN(dueDate.getTime())) {
        this.logger.error(`dueDate không hợp lệ: ${createEventDto.dueDate}`);
        throw new BadRequestException('dueDate không hợp lệ');
      }
    }

   
    const event = this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description || null,
      startDate,
      endDate,
      dueDate,
      user,
    } as Event);

    try {
      const savedEvent = await this.eventRepository.save(event);
      this.logger.log(`Sự kiện "${savedEvent.title}" đã được lưu với ID ${savedEvent.id}`);
      return savedEvent;
    } catch (error) {
      this.logger.error(`Lỗi khi lưu sự kiện: ${error.message}`, error.stack);
      throw new BadRequestException(`Không thể lưu sự kiện: ${error.message}`);
    }
  }

  async findAll(view: CalendarView, date: string, user: User): Promise<Event[]> {
    if (!user?.id) {
      throw new BadRequestException('User không hợp lệ');
    }

    const start = new Date(date);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

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
        throw new BadRequestException('Kiểu xem không hợp lệ');
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
    if (!user?.email) {
      this.logger.error('User không hợp lệ hoặc thiếu email');
      throw new BadRequestException('User không hợp lệ');
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // Look back 6 hours
    const reminderTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Look forward 48 hours

    this.logger.log(
      `Tìm kiếm sự kiện cho người dùng ${user.email} từ ${now.toISOString()} đến ${reminderTime.toISOString()}...`,
    );

    const events = await this.eventRepository.find({
      where: {
        user: { id: user.id },
        dueDate: Between(now, reminderTime),
      },
      relations: ['user'],
    });

    if (events.length === 0) {
      this.logger.log(`Không tìm thấy sự kiện nào cần nhắc nhở cho ${user.email}.`);
    } else {
      this.logger.log(
        `Tìm thấy ${events.length} sự kiện cần nhắc nhở cho ${user.email}: ${events
          .map((e) => e.title)
          .join(', ')}`,
      );
    }

    return events;
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException(`Sự kiện với ID ${id} không tồn tại`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, user: User): Promise<Event> {
    const event = await this.findOne(id);

    if (event.user.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật sự kiện này');
    }

    const updatedEvent = {
      ...event,
      ...updateEventDto,
      startDate: updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate,
      endDate: updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate,
      dueDate: updateEventDto.dueDate ? new Date(updateEventDto.dueDate) : event.dueDate,
    };

    if (updatedEvent.startDate && isNaN(updatedEvent.startDate.getTime())) {
      throw new BadRequestException('startDate không hợp lệ');
    }
    if (updatedEvent.endDate && isNaN(updatedEvent.endDate.getTime())) {
      throw new BadRequestException('endDate không hợp lệ');
    }
    if (updatedEvent.dueDate && isNaN(updatedEvent.dueDate.getTime())) {
      throw new BadRequestException('dueDate không hợp lệ');
    }
    if (updatedEvent.endDate && updatedEvent.startDate && updatedEvent.endDate < updatedEvent.startDate) {
      throw new BadRequestException('endDate phải sau startDate');
    }

    try {
      return await this.eventRepository.save(updatedEvent);
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật sự kiện ${id}: ${error.message}`);
      throw new BadRequestException(`Không thể cập nhật sự kiện: ${error.message}`);
    }
  }

  async remove(id: number, user: User): Promise<void> {
    const event = await this.findOne(id);

    if (event.user.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xóa sự kiện này');
    }

    try {
      await this.eventRepository.remove(event);
      this.logger.log(`Sự kiện với ID ${id} đã được xóa`);
    } catch (error) {
      this.logger.error(`Lỗi khi xóa sự kiện ${id}: ${error.message}`);
      throw new BadRequestException(`Không thể xóa sự kiện: ${error.message}`);
    }
  }
}