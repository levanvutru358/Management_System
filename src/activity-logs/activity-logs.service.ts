import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ActivityLog, ActivityAction } from './entities/activity-log.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { TeamMember } from '../teams/entities/team-member.entity';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);
  logTeamAction: any;

  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  // Ghi lại một hành động liên quan đến task
  async logAction(
    action: ActivityAction,
    task: Task,
    user: User,
    details?: string,
  ): Promise<ActivityLog> {
    this.logger.log(`Ghi log: ${action} cho task ${task.id} bởi user ${user.email}`);

    const log = this.activityLogRepository.create({
      action,
      task,
      taskId: task.id,
      teamId: task.teamId, // Lưu teamId từ task
      user,
      userId: user.id,
      details,
    });

    return this.activityLogRepository.save(log);
  }

  // Lấy danh sách log của một user
  async findByUser(userId: number): Promise<ActivityLog[]> {
    this.logger.log(`Lấy log hoạt động của user ${userId}`);

    const activityLogs = await this.activityLogRepository.find({
      where: { userId },
      relations: ['task', 'user', 'team'],
      order: { createdAt: 'DESC' },
    });

    if (!activityLogs.length) {
      this.logger.warn(`Không tìm thấy log hoạt động cho user ${userId}`);
    }

    return activityLogs;
  }

  // Endpoint GET /activity-logs/user
  async getUserActivityLogs(userId: number): Promise<ActivityLog[]> {
    this.logger.log(`Lấy nhật ký hoạt động của user ${userId}`);
    return this.findByUser(userId);
  }

  // Endpoint GET /activity-logs/team/:teamId
  async getTeamActivityLogs(teamId: number, currentUser: User): Promise<ActivityLog[]> {
    this.logger.log(`Lấy nhật ký hoạt động của team ${teamId}`);

    // Kiểm tra xem user hiện tại có thuộc team không
    const teamMember = await this.teamMembersRepository.findOne({
      where: { teamId, userId: currentUser.id },
    });

    if (!teamMember) {
      throw new ForbiddenException('You do not have permission to access this team’s activity logs');
    }

    // Lấy danh sách thành viên trong team
    const teamMembers = await this.teamMembersRepository.find({
      where: { teamId },
      relations: ['user'],
    });

    const userIds: number[] = teamMembers.map((member) => member.userId);

    if (!userIds.length) {
      this.logger.warn(`Team ${teamId} không có thành viên`);
      return [];
    }

    // Lấy nhật ký hoạt động của team
    return this.activityLogRepository.find({
      where: {
        userId: In(userIds),
        teamId,
        action: In([ActivityAction.CREATED, ActivityAction.UPDATED, ActivityAction.DELETED]),
      },
      relations: ['user', 'task', 'team'],
      order: { createdAt: 'DESC' },
    });
  }
}