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
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { subtasks, attachments, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create(taskData);

    if (subtasks && Array.isArray(subtasks)) {
      task.subtasks = subtasks.map((title: string) =>
        this.subtasksRepository.create({ title }),
      );
    }

    const savedTask = await this.tasksRepository.save(task);

    if (attachments && Array.isArray(attachments)) {
      for (const file of attachments) {
        const attach = this.attachmentsRepository.create({
          filename: file.filename,
          path: file.path,
          task: savedTask,
        });
        await this.attachmentsRepository.save(attach);
      }
    }

    return this.findOne(savedTask.id);
  }

  async findAll() {
    return this.tasksRepository.find({
      relations: ['subtasks', 'attachments'],
    });
  }

  async findAllSystem(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['subtasks', 'attachments'],
    });
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

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
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
        {
          keyword: `%${keyword}%`,
        },
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

  async assignTask(id: number, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    task.assignedUserId = assignTaskDto.assignedUserId;
    return this.tasksRepository.save(task);
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
}
