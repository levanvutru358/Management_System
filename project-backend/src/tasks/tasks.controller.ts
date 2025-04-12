import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  create(@GetUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user);
  }

  @Put(':id')
  @UseGuards(TasksPermissionsGuard)
  @SetMetadata('requireEdit', true)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(+id, updateTaskDto, user);
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