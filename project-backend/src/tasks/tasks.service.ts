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
import { UpdateSubtaskDto } from './dto/create-subtask.dto';
import { Attachment } from './entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

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
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id); // Trả về task đã cập nhật
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.tasksRepository.delete(id);
    return { message: `Task with ID ${id} deleted successfully` };
  }

  async search(userId: number, keyword: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
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
      .where('task.dueDate <= :tomorrow', { tomorrow })
      .andWhere('task.status != :done', { done: 'done' })
      .getMany();
  }

  async assignTask(id: number, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
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
    const tasks = await this.tasksRepository.find({ where: { userId } });
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

  async getSubtasks(taskId: number): Promise<Subtask[]> {
    return this.subtasksRepository.find({ where: { taskId } });
  }

  async updateSubtask(
    id: number,
    updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<Subtask> {
    const subtask = await this.subtasksRepository.findOneBy({ id });
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }
    await this.subtasksRepository.update(id, updateSubtaskDto);
    return this.subtasksRepository.findOneByOrFail({ id });
  }

  async removeSubtask(id: number): Promise<{ message: string }> {
    const subtask = await this.subtasksRepository.findOneBy({ id });
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }
    await this.subtasksRepository.delete(id);
    return { message: `Subtask with ID ${id} deleted successfully` };
  }

  async getTaskWithSubtasks(id: number): Promise<any> {
    const task = await this.findOne(id);
    const subtasks = await this.subtasksRepository.find({
      where: { taskId: id },
    });
    return { ...task, subtasks };
  }

  async uploadAttachment(
    taskId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const task = await this.tasksRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Kiểm tra dữ liệu tệp
    if (
      !file ||
      typeof file.originalname !== 'string' ||
      !(file.buffer instanceof Buffer) ||
      typeof file.mimetype !== 'string' ||
      typeof file.size !== 'number'
    ) {
      throw new Error('Invalid file data');
    }

    // Tạo thư mục lưu trữ tệp nếu chưa tồn tại
    const uploadDir = path.join(process.cwd(), 'uploads'); // Đảm bảo thư mục nằm ở gốc dự án
    console.log('Upload directory:', uploadDir); // Log để kiểm tra đường dẫn

    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Upload directory created successfully.');
      } catch (error) {
        console.error('Error creating upload directory:', error);
        throw new Error('Failed to create upload directory');
      }
    }

    // Lưu tệp vào thư mục
    const sanitizedFileName = (
      file as Express.Multer.File
    ).originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Loại bỏ ký tự không hợp lệ
    const filePath = path.join(uploadDir, sanitizedFileName);
    console.log('File path:', filePath); // Log để kiểm tra đường dẫn tệp

    try {
      fs.writeFileSync(filePath, (file as Express.Multer.File).buffer);
      console.log('File saved successfully.');
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }

    // Lưu thông tin tệp vào cơ sở dữ liệu
    const attachment = this.attachmentsRepository.create({
      fileName: sanitizedFileName,
      filePath: `uploads/${sanitizedFileName}`,
      fileType: (file as Express.Multer.File).mimetype,
      fileSize: (file as Express.Multer.File).size,
      task,
    });

    try {
      return await this.attachmentsRepository.save(attachment);
    } catch (error) {
      console.error('Error saving attachment to database:', error);
      throw new Error('Failed to save attachment to database');
    }
  }
  async getAttachments(taskId: number): Promise<Attachment[]> {
    return this.attachmentsRepository.find({ where: { task: { id: taskId } } });
  }

  checkPermission(task: Task, userId: number, requireEdit = false): void {
    if (task.userId !== userId && task.assignedUserId !== userId) {
      if (requireEdit && task.userId !== userId) {
        throw new ForbiddenException('Permission denied: only owner can edit');
      }
      throw new ForbiddenException('Permission denied');
    }
  }
}
