import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({ where: { userId } });
  }

  async findAllSystem(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new ForbiddenException('Task not found');
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.dueDate <= :tomorrow', { tomorrow })
      .andWhere('task.status != :done', { done: 'done' })
      .getMany();
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    task.assignedUserId = assignTaskDto.assignedUserId;
    return this.tasksRepository.save(task);
  }

  async addComment(taskId: number, userId: number, content: string): Promise<Comment> {
    const comment = this.commentsRepository.create({ taskId, userId, content });
    return this.commentsRepository.save(comment);
  }

  async getComments(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { taskId } });
  }

  async getStats(userId: number): Promise<any> {
    const tasks = await this.tasksRepository.find({ where: { userId } });
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    };
  }

  checkPermission(task: Task, userId: number, requireEdit = false): void {
    if (task.userId !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException('You do not have permission to access this task');
    }
    if (requireEdit && task.userId !== userId) {
      throw new ForbiddenException('Only the owner can edit this task');
    }
  }
}