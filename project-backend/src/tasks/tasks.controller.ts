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
import { SetMetadata } from '@nestjs/common';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'attachments', maxCount: 10 }, // Đặt tối đa 10 file
      ],
      {
        storage: diskStorage({
          destination: './uploads/tasks', // folder lưu trữ
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
      },
    ),
  )
  async create(
    @GetUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFiles()
    files: {
      attachments?: Express.Multer.File[];
    },
  ) {
    return this.tasksService.create({
      ...createTaskDto,
      userId: user.id,
      attachments: files?.attachments?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })),
    });
  }

  @Get()
  async findAll() {
    return this.tasksService.findAll(); // <-- đã sửa đúng tên
  }

  @Put(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get('search')
  findAllWithSearch(@GetUser() user: User, @Query('keyword') keyword: string) {
    return this.tasksService.search(user.id, keyword);
  }

  @Post(':id/assign')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  assign(@Param('id') id: string, @Body() assignTaskDto: AssignTaskDto) {
    return this.tasksService.assignTask(+id, assignTaskDto);
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
