import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { Subtask } from './entities/subtask.entity';
import { Attachment } from './entities/attachment.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

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
    private readonly notificationsService: NotificationsService
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { subtasks, attachments, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create(taskData);
    const savedTask = await this.tasksRepository.save(task);

    await this.saveSubtasks(subtasks ?? [], savedTask);
    await this.saveAttachments(attachments ?? [], savedTask);

    if (savedTask.assignedUserId) {
      await this.notificationsService.notifyTaskAssigned(
        savedTask.title,
        `${savedTask.assignedUserId}`
      );
    } 

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
    
    if (task.assignedUserId) {
      await this.notificationsService.notifyTaskAssigned(
        task.title,
        `${task.assignedUserId}`
      );
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
  }

  async findAllSystem(): Promise<Task[]> {
    return this.findAll();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['subtasks', 'attachments'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

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
  }

  async assignTask(
    id: number,
    assignTaskDto: AssignTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id);
    this.checkPermission(task, user.id, true);

    task.assignedUserId = assignTaskDto.assignedUserId;
    const savedTask = await this.tasksRepository.save(task);

    await this.notificationsService.notifyTaskAssigned(task.title, `${task.assignedUserId}`);

    return savedTask;
  }

  async addComment(
    taskId: number,
    userId: number,
    content: string,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({ taskId, userId, content });
    return this.commentsRepository.save(comment);
  }

  async getComments(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { taskId } });
  }

  async getStats(userId: number): Promise<any> {
    const tasks = await this.tasksRepository.find({
      where: { userId },
      relations: ['subtasks'],
    });
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'done',
      ).length,
    };
  }

  checkPermission(task: Task, userId: number, requireEdit = false): void {
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
    }
  }

  async checkTasksDueSoon() {
    const tasks = await this.tasksRepository.find();
    tasks.forEach((task) => {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const timeDifference = dueDate.getTime() - now.getTime();

      if (timeDifference <= 24 * 60 * 60 * 1000 && task.assignedUserId) {
        this.notificationsService.notifyTaskDueSoon(
          task.id,
          `${task.assignedUserId}`
        );
      }
    });
  }
}