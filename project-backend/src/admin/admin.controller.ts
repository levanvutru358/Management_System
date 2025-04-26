import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards } from '@nestjs/common/decorators/core';
import { Delete, Get, Param, Put } from '@nestjs/common/decorators/http';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // Combine guards: JWT first, then Admin
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/lock')
  lockUser(@Param('id') id: string) {
    return this.adminService.lockUser(+id);
  }

  @Put('users/:id/unlock')
  unlockUser(@Param('id') id: string) {
    return this.adminService.unlockUser(+id);
  }

  @Get('tasks')
  getAllTasks() {
    return this.adminService.getAllTasks();
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) {
    return this.adminService.deleteTask(+id);
  }
}
