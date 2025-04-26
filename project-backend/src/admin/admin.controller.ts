import { Controller, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
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
