import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  SetMetadata,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksPermissionsGuard } from './tasks-permissions.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

// Cấu hình lưu trữ file upload
const storage = diskStorage({
  destination: './uploads/tasks',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('tasks')
@UseGuards(JwtAuthGuard) // Bảo vệ tất cả các route bằng JWT
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Tạo một task mới.
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], { storage }),
  )
  async create(
    @GetUser() user: User,
    @Body() body: any,
    @UploadedFiles()
    files: { attachments?: Express.Multer.File[] },
  ) {
    const { subtasks, ...taskData } = body;

    // Xử lý subtasks
    let parsedSubtasks: { title: string; completed?: boolean }[] = [];
    if (subtasks) {
      try {
        parsedSubtasks =
          typeof subtasks === 'string' ? JSON.parse(subtasks) : subtasks;
      } catch {
        throw new BadRequestException('Invalid subtasks JSON format');
      }
    }

    // Tạo DTO cho task
    const createTaskDto: CreateTaskDto = {
      ...taskData,
      assignedUserId: taskData.assignedUserId || user.id,
      subtasks: parsedSubtasks,
      attachments: files?.attachments?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })),
    };

    return this.tasksService.create(createTaskDto, user);
  }

  /**
   * Lấy danh sách tất cả các task của người dùng hiện tại.
   */
  @Get()
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user);
  }

  /**
   * Cập nhật thông tin của một task.
   */
  @Put(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], { storage }),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: { attachments?: Express.Multer.File[] },
    @GetUser() user: User,
  ) {
    const { subtasks, ...taskData } = body;
    let parsedSubtasks: { title: string; completed?: boolean }[] = [];
    if (subtasks) {
      try {
        parsedSubtasks =
          typeof subtasks === 'string' ? JSON.parse(subtasks) : subtasks;
      } catch {
        throw new BadRequestException('Invalid subtasks JSON format');
      }
    }
    const updateTaskDto: UpdateTaskDto = {
      ...taskData,
      subtasks: parsedSubtasks,
      attachments: files?.attachments?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })),
    };
    return this.tasksService.update(+id, updateTaskDto, user);
  }

  /**
   * Xóa một task.
   */
  @Delete(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.remove(+id, user);
  }

  /**
   * Tìm kiếm task theo từ khóa.
   */
  @Get('search')
  findAllWithSearch(@GetUser() user: User, @Query('keyword') keyword: string) {
    if (!keyword) {
      throw new BadRequestException('Keyword is required for search');
    }
    return this.tasksService.search(user.id, keyword);
  }

  /**
   * Gán task cho một người dùng khác.
   */
  @Post(':id/assign')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  assign(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
    @GetUser() user: User,
  ) {
    if (!assignTaskDto.assignedUserId) {
      throw new BadRequestException('Assigned user ID is required');
    }
    return this.tasksService.assignTask(+id, assignTaskDto, user);
  }

  /**
   * Thêm comment vào một task.
   */
  @Post(':id/comments')
  @UseGuards(TasksPermissionsGuard)
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @GetUser() user: User,
  ) {
    if (!content) {
      throw new BadRequestException('Comment content is required');
    }
    return this.tasksService.addComment(+id, user.id, content);
  }

  /**
   * Lấy danh sách các comment của một task.
   */
  @Get(':id/comments')
  @UseGuards(TasksPermissionsGuard)
  getComments(@Param('id') id: string) {
    return this.tasksService.getComments(+id);
  }

  /**
   * Lấy thống kê về task của người dùng hiện tại.
   */
  @Get('stats')
  getStats(@GetUser() user: User) {
    return this.tasksService.getStats(user.id);
  }
}
