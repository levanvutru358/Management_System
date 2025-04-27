// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { ActivityLog } from './entities/activity-log.entity';
// import { CreateActivityLogDto } from './dto/create-activity-log.dto';
// import { User } from '../users/entities/user.entity';

// @Injectable()
// export class ActivityLogsService {
//   private readonly logger = new Logger(ActivityLogsService.name);

//   constructor(
//     @InjectRepository(ActivityLog)
//     private activityLogRepository: Repository<ActivityLog>,
//   ) {}

//   async create(user: User, createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
//     this.logger.log(
//       `Tạo log: ${createActivityLogDto.action} ${createActivityLogDto.entityType} ID ${createActivityLogDto.entityId} bởi ${user.email}`,
//     );
//     const log = this.activityLogRepository.create({
//       ...createActivityLogDto,
//       user,
//     });
//     try {
//       return await this.activityLogRepository.save(log);
//     } catch (error) {
//       this.logger.error(`Lỗi khi lưu log: ${error.message}`);
//       throw error;
//     }
//   }

//   async findAll(): Promise<ActivityLog[]> {
//     this.logger.log('Tìm tất cả logs');
//     return this.activityLogRepository.find({
//       relations: ['user'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async findByUser(userId: number): Promise<ActivityLog[]> {
//     this.logger.log(`Tìm logs cho user ID ${userId}`);
//     return this.activityLogRepository.find({
//       where: { user: { id: userId } },
//       relations: ['user'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async findOne(id: number): Promise<ActivityLog> {
//     const log = await this.activityLogRepository.findOne({
//       where: { id },
//       relations: ['user'],
//     });
//     if (!log) {
//       throw new Error(`Log ID ${id} không tồn tại`);
//     }
//     return log;
//   }

//   async update(id: number, updateActivityLogDto: any): Promise<ActivityLog> {
//     const log = await this.findOne(id);
//     Object.assign(log, updateActivityLogDto);
//     return this.activityLogRepository.save(log);
//   }

//   async remove(id: number): Promise<void> {
//     const log = await this.findOne(id);
//     await this.activityLogRepository.remove(log);
//   }
// }