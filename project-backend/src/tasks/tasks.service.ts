<<<<<<< HEAD
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
=======
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
<<<<<<< HEAD
import { User } from '../users/entities/user.entity';
=======
import { Subtask } from './entities/subtask.entity';
import { Attachment } from './entities/attachment.entity';
import { User } from 'src/users/entities/user.entity';
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df

@Injectable()
export class TasksService {
  usersRepository: any;
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
<<<<<<< HEAD
    private commentsRepository: Repository<Comment>, // Thêm repository cho User
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({ ...createTaskDto, user });
    return this.tasksRepository.save(task);
  }

  async findAll(user: User): Promise<Task[]> {
    return this.tasksRepository.find({ where: { user: { id: user.id } } });
=======
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Subtask)
    private subtasksRepository: Repository<Subtask>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { subtasks, attachments, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create(taskData);
    const savedTask = await this.tasksRepository.save(task);

    await this.saveSubtasks(subtasks ?? [], savedTask);
    await this.saveAttachments(attachments ?? [], savedTask);

    return this.findOne(savedTask.id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const { subtasks, attachments, ...taskData } = updateTaskDto;
    const task = await this.findOne(id);
    Object.assign(task, taskData);
    await this.tasksRepository.save(task);

    if (Array.isArray(subtasks)) {
      await this.subtasksRepository.delete({ task: { id } });
      await this.saveSubtasks(subtasks ?? [], task);
    }

    if (Array.isArray(attachments)) {
      await this.attachmentsRepository.delete({ task: { id } });
      await this.saveAttachments(attachments ?? [], task);
    }

    return this.findOne(id);
  }

  private async saveSubtasks(
    subtasks: { title: string; completed?: boolean }[],
    task: Task,
  ) {
    if (!subtasks.length) return;
    const entities = subtasks.map((item) =>
      this.subtasksRepository.create({
        title: item.title,
        completed: item.completed ?? false,
        task,
      }),
    );
    await this.subtasksRepository.save(entities);
  }

  private async saveAttachments(
    attachments: { filename: string; path: string }[],
    task: Task,
  ) {
    if (!attachments.length) return;
    const entities = attachments.map((file) =>
      this.attachmentsRepository.create({
        filename: file.filename,
        path: file.path,
        task,
      }),
    );
    await this.attachmentsRepository.save(entities);
  }

  async findAll() {
    return this.tasksRepository.find({
      relations: ['subtasks', 'attachments'],
    });
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
  }

  async findAllSystem(): Promise<Task[]> {
    return this.findAll();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
<<<<<<< HEAD
      relations: ['user'],
=======
      relations: ['subtasks', 'attachments'],
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

<<<<<<< HEAD
  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    await this.findOne(id); // Throws if not found
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    await this.findOne(id); // Throws if not found
=======
  async remove(
    id: number,
    user: { id: number; role: string },
  ): Promise<{ message: string }> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (user.role !== 'admin' && task.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this task',
      );
    }

>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    await this.tasksRepository.delete(id);
    return { message: `Task with ID ${id} deleted successfully` };
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.attachments', 'attachments')
      .where('task.userId = :userId', { userId })
      .andWhere(
        '(task.title LIKE :keyword OR task.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .getMany();
  }

  async findAllDueSoon(): Promise<Task[]> {
<<<<<<< HEAD
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
      relations: ['user'], // Changed from 'assignee' to 'user' for consistency
    });
=======
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.attachments', 'attachments')
      .where('task.dueDate <= :tomorrow', { tomorrow })
      .andWhere('task.status != :done', { done: 'done' })
      .getMany();
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
  }

  async assignTask(
    id: number,
    assignTaskDto: AssignTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id);
    this.checkPermission(task, user.id, true);
    task.assignedUserId = assignTaskDto.assignedUserId;
    return this.tasksRepository.save(task);
  }

<<<<<<< HEAD
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
    
=======
  async addComment(
    taskId: number,
    userId: number,
    content: string,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({ taskId, userId, content });
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    return this.commentsRepository.save(comment);
  }
  
  async getComments(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ 
      where: { task: { id: taskId } },
      relations: ['user']
    });
  }

  async getStats(userId: number): Promise<any> {
<<<<<<< HEAD
    const tasks = await this.tasksRepository.find({ where: { user: { id: userId } } });
=======
    const tasks = await this.tasksRepository.find({
      where: { userId },
      relations: ['subtasks'],
    });
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'Todo').length, // Match case with entity default
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
<<<<<<< HEAD
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
=======
      overdue: tasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'done',
      ).length,
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    };
  }

  checkPermission(task: Task, userId: number, requireEdit = false): void {
<<<<<<< HEAD
    if (task.user.id !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException('You do not have permission to access this task');
    }
    if (requireEdit && task.user.id !== userId) {
      throw new ForbiddenException('Only the owner can edit this task');
=======
    if (task.userId !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this task',
      );
    }
    if (
      requireEdit &&
      task.userId !== userId &&
      task.assignedUserId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to edit this task',
      );
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
    }
  }
}
