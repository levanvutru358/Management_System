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

const storage = diskStorage({
  destination: './uploads/tasks',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], {
      storage,
    }),
  )
  async create(
    @GetUser() user: User,
    @Body() body: any,
    @UploadedFiles()
    files: {
      attachments?: Express.Multer.File[];
    },
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

    const createTaskDto: CreateTaskDto = {
      ...taskData,
      userId: user.id,
      subtasks: parsedSubtasks,
      attachments: files?.attachments?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })),
    };

    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], {
      storage,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      attachments?: Express.Multer.File[];
    },
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

    return this.tasksService.update(+id, updateTaskDto);
  }

  @Get()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Delete(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.remove(+id, user);
  }

  @Get('search')
  findAllWithSearch(@GetUser() user: User, @Query('keyword') keyword: string) {
    return this.tasksService.search(user.id, keyword);
  }

  @Post(':id/assign')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  assign(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.assignTask(+id, assignTaskDto, user);
  }

  @Post(':id/comments')
  @UseGuards(TasksPermissionsGuard)
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @GetUser() user: User,
  ) {
    return this.tasksService.addComment(+id, user.id, content);
  }

  @Get(':id/comments')
  @UseGuards(TasksPermissionsGuard)
  getComments(@Param('id') id: string) {
    return this.tasksService.getComments(+id);
  }

  @Get('stats')
  getStats(@GetUser() user: User) {
    return this.tasksService.getStats(user.id);
  }
}