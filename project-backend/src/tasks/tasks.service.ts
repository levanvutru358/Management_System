import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  usersRepository: any;
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>, // Thêm repository cho User
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({ ...createTaskDto, user });
    return this.tasksRepository.save(task);
  }

  async findAll(user: User): Promise<Task[]> {
    return this.tasksRepository.find({ where: { user: { id: user.id } } });
  }

  async findAllSystem(): Promise<Task[]> {
    return this.tasksRepository.find();
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
    await this.findOne(id); // Throws if not found
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    await this.findOne(id); // Throws if not found
    await this.tasksRepository.delete(id);
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('(task.title LIKE :keyword OR task.description LIKE :keyword)', {
        keyword: `%${keyword}%`,
      })
      .getMany();
  }

  async findAllDueSoon(): Promise<Task[]> {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return this.tasksRepository.find({
      where: {
        deadline: Between(now, next48Hours),
      },
      relations: ['user'],
    });
  }

  async findAllWithDeadline(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { deadline: Not(IsNull()) },
      relations: ['user'], // Changed from 'assignee' to 'user' for consistency
    });
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    task.assignedUserId = assignTaskDto.assignedUserId;
    return this.tasksRepository.save(task);
  }

  async addComment(taskId: number, userId: number, content: string): Promise<Comment> {
    const task = await this.tasksRepository.findOneBy({ id: taskId });
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    if (!task || !user) {
      throw new NotFoundException('Task or User not found');
    }
  
    const comment = this.commentsRepository.create({
      content,
      task,
      user
    });
    
    return this.commentsRepository.save(comment);
  }
  
  async getComments(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ 
      where: { task: { id: taskId } },
      relations: ['user']
    });
  }

  async getStats(userId: number): Promise<any> {
    const tasks = await this.tasksRepository.find({ where: { user: { id: userId } } });
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'Todo').length, // Match case with entity default
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length,
    };
  }

  checkPermission(task: Task, userId: number, requireEdit = false): void {
    if (task.user.id !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException('You do not have permission to access this task');
    }
    if (requireEdit && task.user.id !== userId) {
      throw new ForbiddenException('Only the owner can edit this task');
    }
  }
}