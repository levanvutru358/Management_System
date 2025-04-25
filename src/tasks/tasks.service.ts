import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      status: createTaskDto.status || 'Todo',
      priority: createTaskDto.priority || 'low',
      assignedUserId: createTaskDto.assignedUserId || user.id,
      user, // Quan hệ ManyToOne với User
    });

    return this.tasksRepository.save(task);
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

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id);
    this.checkPermission(task, user, true);
    if (updateTaskDto.dueDate) {
      updateTaskDto.dueDate = new Date(updateTaskDto.dueDate) as any;
    }
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number, user: User): Promise<void> {
    const task = await this.findOne(id);
    this.checkPermission(task, user, true);
    await this.tasksRepository.delete(id);
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.assignedUserId = :userId', { userId }) // Sửa userId thành assignedUserId
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

  async assignTask(id: number, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const assignedUser = await this.usersService.findById(assignTaskDto.assignedUserId);
    if (!assignedUser) {
      throw new NotFoundException(`User with ID ${assignTaskDto.assignedUserId} not found`);
    }
    task.assignedUserId = assignedUser.id;
    return this.tasksRepository.save(task);
  }

  async addComment(taskId: number, userId: number, content: string): Promise<Comment> {
    const task = await this.findOne(taskId);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const comment = this.commentsRepository.create({
      content,
      task,
      user,
    });

    return this.commentsRepository.save(comment);
  }

  async getComments(taskId: number): Promise<Comment[]> {
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