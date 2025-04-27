import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity'; // Thêm import EventStatus
import { User } from '../users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { CalendarView } from './interfaces/calendar-view.enum';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateEventDto, user: User): Promise<Event> {
    this.logger.log(`Bắt đầu tạo sự kiện: ${JSON.stringify(dto)} bởi user ${user.email}`);

    const assignedBy = await this.userRepository.findOne({ where: { id: dto.assignedById } });
    const createdBy = await this.userRepository.findOne({ where: { id: dto.createdById } });

    if (!assignedBy || !createdBy) {
      this.logger.error(
        `Không tìm thấy assignedBy hoặc creator: assignedById=${dto.assignedById}, createdById=${dto.createdById}`,
      );
      throw new HttpException('assignedBy or Creator not found', HttpStatus.NOT_FOUND);
    }

    if (user.id !== createdBy.id) {
      this.logger.warn(`Người dùng ${user.email} không có quyền tạo sự kiện với createdById=${dto.createdById}`);
      throw new HttpException('Unauthorized: User does not match creator', HttpStatus.UNAUTHORIZED);
    }

    const event = new Event();
    event.title = dto.title;
    event.description = dto.description;
    event.startDate = new Date(dto.startDate);
    event.dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
    event.assignedBy = assignedBy;
    event.createdBy = createdBy;
    event.status = EventStatus.PENDING; // Sử dụng enum thay vì string
    event.user = createdBy;
    event.reminderEmails = dto.reminderEmails;

    const savedEvent = await this.eventRepository.save(event);
    this.logger.log(`Tạo sự kiện thành công: id=${savedEvent.id}`);
    return savedEvent;
  }

  async update(id: number, dto: UpdateEventDto, user: User): Promise<Event> {
    this.logger.log(`Bắt đầu cập nhật sự kiện id=${id}`);

    const event = await this.eventRepository.findOne({ where: { id }, relations: ['createdBy'] });
    if (!event) {
      this.logger.error(`Không tìm thấy sự kiện với id=${id}`);
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    // Kiểm tra createdBy có tồn tại không trước khi truy cập
    if (!event.createdBy || event.createdBy.id !== user.id) {
      this.logger.warn(`Người dùng ${user.email} không có quyền cập nhật sự kiện id=${id}`);
      throw new HttpException('Unauthorized: User does not match creator', HttpStatus.UNAUTHORIZED);
    }

    if (dto.assignedById) {
      const assignedBy = await this.userRepository.findOne({ where: { id: dto.assignedById } });
      if (!assignedBy) {
        this.logger.error(`Không tìm thấy assignedBy với id=${dto.assignedById}`);
        throw new HttpException('assignedBy not found', HttpStatus.NOT_FOUND);
      }
      event.assignedBy = assignedBy;
    }

    Object.assign(event, dto);
    if (dto.dueDate) {
      event.dueDate = new Date(dto.dueDate);
    }

    const updatedEvent = await this.eventRepository.save(event);
    this.logger.log(`Cập nhật sự kiện thành công: id=${id}`);
    return updatedEvent;
  }

  async findAll(view: CalendarView, date: string, user: User): Promise<Event[]> {
    this.logger.log(`Lấy danh sách sự kiện: view=${view}, date=${date}, user=${user.email}`);

    const dto: FilterEventDto = { view, date };
    let start: Date, end: Date;
    const parsedDate = new Date(date);

    if (dto.view === CalendarView.DAY) {
      start = new Date(parsedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(parsedDate);
      end.setHours(23, 59, 59, 999);
    } else if (dto.view === CalendarView.WEEK) {
      start = new Date(parsedDate);
      start.setDate(parsedDate.getDate() - parsedDate.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
      end = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.assignedBy', 'assignedBy')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.task', 'task')
      .where('event.startDate >= :start AND event.startDate <= :end', { start, end })
      .andWhere('event.createdBy.id = :userId', { userId: user.id })
      .getMany();

    this.logger.log(`Tìm thấy ${events.length} sự kiện`);
    return events;
  }

  async findUpcomingDeadlines(user: User): Promise<Event[]> {
    this.logger.log(`Lấy danh sách sự kiện sắp đến hạn cho user ${user.email}`);

    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.assignedBy', 'assignedBy')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.createdBy', 'createdBy') // Thêm join createdBy để đảm bảo truy vấn
      .where('event.dueDate <= :oneDayLater AND event.dueDate >= :now', { oneDayLater, now })
      .andWhere('event.status = :status', { status: EventStatus.PENDING }) // Sử dụng enum
      .andWhere('event.dueDate IS NOT NULL')
      .andWhere('event.createdBy.id = :userId', { userId: user.id })
      .getMany();

    this.logger.log(`Tìm thấy ${events.length} sự kiện sắp đến hạn`);
    return events;
  }

  async remove(id: number, user: User): Promise<void> {
    this.logger.log(`Bắt đầu xóa sự kiện id=${id}`);

    const event = await this.eventRepository.findOne({ where: { id }, relations: ['createdBy'] });
    if (!event) {
      this.logger.error(`Không tìm thấy sự kiện với id=${id}`);
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    // Kiểm tra createdBy có tồn tại không trước khi truy cập
    if (!event.createdBy || event.createdBy.id !== user.id) {
      this.logger.warn(`Người dùng ${user.email} không có quyền xóa sự kiện id=${id}`);
      throw new HttpException('Unauthorized: User does not match creator', HttpStatus.UNAUTHORIZED);
    }

    await this.eventRepository.delete(id);
    this.logger.log(`Xóa sự kiện thành công: id=${id}`);
  }
}