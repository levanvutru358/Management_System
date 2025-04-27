import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { Subtask } from './entities/subtask.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { SubtaskInputDto, AttachmentInputDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Subtask)
    private subtasksRepository: Repository<Subtask>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    private usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { subtasks, attachments, startDate, dueDate, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create({
      ...taskData,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: taskData.status || 'Todo',
      priority: taskData.priority || 'low',
      assignedUserId: taskData.assignedUserId || user.id,
      user,
    });

    const savedTask = await this.tasksRepository.save(task);
    await this.saveSubtasks(subtasks ?? [], savedTask);
    await this.saveAttachments(attachments ?? [], savedTask);

    return this.findOne(savedTask.id);
  }

  async findAll(user: User): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedUserId: user.id },
      relations: ['user', 'subtasks', 'attachments', 'comments'],
    });
  }

  async findAllSystem(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['user', 'subtasks', 'attachments', 'comments'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user', 'subtasks', 'attachments', 'comments'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id);
    this.checkPermission(task, user, true);

    const { subtasks, attachments, startDate, dueDate, ...taskData } = updateTaskDto;
    Object.assign(task, {
      ...taskData,
      startDate: startDate ? new Date(startDate) : task.startDate,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
    });

    await this.tasksRepository.save(task);

    if (Array.isArray(subtasks)) {
      await this.subtasksRepository.delete({ task: { id } });
      await this.saveSubtasks(subtasks, task);
    }

    if (Array.isArray(attachments)) {
      await this.attachmentsRepository.delete({ task: { id } });
      await this.saveAttachments(attachments, task);
    }

    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<{ message: string }> {
    const task = await this.findOne(id);
    this.checkPermission(task, user, true);
    await this.tasksRepository.delete(id);
    return { message: `Task with ID ${id} deleted successfully` };
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.assignedUserId = :userId', { userId })
      .andWhere('(task.title LIKE :keyword OR task.description LIKE :keyword)', {
        keyword: `%${keyword}%`,
      })
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.attachments', 'attachments')
      .leftJoinAndSelect('task.comments', 'comments')
      .getMany();
  }

  async findAllDueSoon(): Promise<Task[]> {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return this.tasksRepository.find({
      where: {
        dueDate: Between(now, next48Hours),
        status: Not('Done'),
      },
      relations: ['user', 'subtasks', 'attachments', 'comments'],
    });
  }

  async findAllWithDeadline(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { dueDate: Not(IsNull()) },
      relations: ['user', 'subtasks', 'attachments', 'comments'],
    });
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id);
    this.checkPermission(task, user, true);
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

  async getStats(userId: number): Promise<any> {
    const tasks = await this.tasksRepository.find({
      where: { assignedUserId: userId },
      relations: ['subtasks'],
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

  private async saveSubtasks(subtasks: SubtaskInputDto[], task: Task) {
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

  private async saveAttachments(attachments: AttachmentInputDto[], task: Task) {
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
}