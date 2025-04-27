import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityLog, ActivityAction } from '../activity-logs/entities/activity-log.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(ActivityLog) 
    private activityLogRepository: Repository<ActivityLog>,
    private usersService: UsersService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      status: createTaskDto.status || 'Todo',
      priority: createTaskDto.priority || 'low',
      assignedUserId: createTaskDto.assignedUserId || user.id,
      user,
    });

    const savedTask = await this.tasksRepository.save(task);

    await this.activityLogsService.logAction(
      ActivityAction.CREATED,
      savedTask,
      user,
      `Task "${savedTask.title}" đã được tạo`,
    );

    return savedTask;
  }

  async findAll(user: User): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedUserId: user.id },
      relations: ['user'],
    });
  }

  async findAllSystem(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ['user'] });
  }

  async findOne(id: number, user?: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    if (user) {
      this.checkPermission(task, user, false);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);
    this.checkPermission(task, user, true);

    if (updateTaskDto.dueDate) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }
    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description) task.description = updateTaskDto.description;
    if (updateTaskDto.status) task.status = updateTaskDto.status;
    if (updateTaskDto.priority) task.priority = updateTaskDto.priority;

    const updatedTask = await this.tasksRepository.save(task);

    await this.activityLogsService.logAction(
      ActivityAction.UPDATED,
      updatedTask,
      user,
      `Task "${updatedTask.title}" đã được cập nhật`,
    );

    return updatedTask;
  }

  async remove(id: number, user: User): Promise<void> {
    try {
      // Tìm task để kiểm tra
      const task = await this.findOne(id, user);
      this.checkPermission(task, user, true);

      // Xóa các bản ghi ActivityLog liên quan trước
      await this.activityLogRepository.delete({ taskId: id });

      // Xóa task
      await this.tasksRepository.delete(id);

      // Ghi log hành động xóa (sau khi xóa task để tránh lỗi khóa ngoại)
      await this.activityLogsService.logAction(
        ActivityAction.DELETED,
        task,
        user,
        `Task "${task.title}" đã bị xóa`,
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete task: ${error.message}`);
    }
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.assignedUserId = :userId', { userId })
      .andWhere('(task.title LIKE :keyword OR task.description LIKE :keyword)', {
        keyword: `%${keyword}%`,
      })
      .leftJoinAndSelect('task.user', 'user')
      .getMany();
  }

  async findAllDueSoon(): Promise<Task[]> {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return this.tasksRepository.find({
      where: {
        dueDate: Between(now, next48Hours),
      },
      relations: ['user'],
    });
  }

  async findAllWithDeadline(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { dueDate: Not(IsNull()) },
      relations: ['user'],
    });
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);
    this.checkPermission(task, user, true);

    const assignedUser = await this.usersService.findById(assignTaskDto.assignedUserId);
    if (!assignedUser) {
      throw new NotFoundException(`User with ID ${assignTaskDto.assignedUserId} not found`);
    }
    task.assignedUserId = assignedUser.id;
    const updatedTask = await this.tasksRepository.save(task);

    await this.activityLogsService.logAction(
      ActivityAction.ASSIGNED,
      updatedTask,
      user,
      `Task "${updatedTask.title}" đã được gán cho user ${assignedUser.email}`,
    );

    return updatedTask;
  }

  async addComment(taskId: number, userId: number, content: string): Promise<Comment> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const task = await this.findOne(taskId, user);

    const comment = this.commentsRepository.create({
      content,
      task,
      user,
    });

    const savedComment = await this.commentsRepository.save(comment);

    await this.activityLogsService.logAction(
      ActivityAction.COMMENTED,
      task,
      user,
      `User ${user.email} đã thêm comment vào task "${task.title}"`,
    );

    return savedComment;
  }

  async getComments(taskId: number, user: User): Promise<Comment[]> {
    const task = await this.findOne(taskId, user);
    return this.commentsRepository.find({
      where: { task: { id: taskId } },
      relations: ['user'],
    });
  }

  async getStats(assignedUserId: number): Promise<any> {
    const tasks = await this.tasksRepository.find({
      where: { assignedUserId },
      relations: ['user'],
    });
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'Todo').length,
      inProgress: tasks.filter((t) => t.status === 'InProgress').length,
      done: tasks.filter((t) => t.status === 'Done').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done',
      ).length,
    };
  }

  checkPermission(task: Task, user: User, requireEdit = false): void {
    const isOwner = task.user?.id === user.id;
    const isAssigned = task.assignedUserId === user.id;

    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('You do not have permission to access this task');
    }

    if (requireEdit && !isOwner) {
      throw new ForbiddenException('You do not have permission to edit this task');
    }
  }
}