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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksPermissionsGuard } from './tasks-permissions.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';
import { Attachment } from './entities/attachment.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@GetUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create({ ...createTaskDto, userId: user.id });
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user.id);
  }

  @Put(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true) // Yêu cầu quyền chỉnh sửa
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true) // Yêu cầu quyền chỉnh sửa
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get('search')
  findAllWithSearch(@GetUser() user: User, @Query('keyword') keyword: string) {
    return this.tasksService.search(user.id, keyword);
  }

  @Post(':id/assign')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true) // Yêu cầu quyền chỉnh sửa
  assign(@Param('id') id: string, @Body() assignTaskDto: AssignTaskDto) {
    return this.tasksService.assignTask(+id, assignTaskDto);
  }

  @Post(':id/comments')
  @UseGuards(TasksPermissionsGuard) // Chỉ cần quyền truy cập
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @GetUser() user: User,
  ) {
    return this.tasksService.addComment(+id, user.id, content);
  }

  @Get(':id/comments')
  @UseGuards(TasksPermissionsGuard) // Chỉ cần quyền truy cập
  getComments(@Param('id') id: string) {
    return this.tasksService.getComments(+id);
  }

  @Get('stats')
  getStats(@GetUser() user: User) {
    return this.tasksService.getStats(user.id);
  }

  // Chức năng tải lên tệp đính kèm
  @Post(':id/attachments')
  @UseGuards(TasksPermissionsGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Attachment> {
    console.log('Uploaded file:', file);
    return this.tasksService.uploadAttachment(+id, file);
  }

  // Chức năng lấy danh sách tệp đính kèm
  @Get(':id/attachments')
  @UseGuards(TasksPermissionsGuard)
  async getAttachments(@Param('id') id: string): Promise<Attachment[]> {
    return this.tasksService.getAttachments(+id);
  }
}
