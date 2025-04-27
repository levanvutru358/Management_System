import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tasksService: TasksService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy từ JwtAuthGuard
    const taskId = +request.params.id; // Lấy ID task từ param

    // Lấy task từ database, truyền user để kiểm tra quyền truy cập
    const task = await this.tasksService.findOne(taskId, user);
    if (!task) {
      throw new ForbiddenException('Task not found');
    }

    // Kiểm tra quyền chỉnh sửa (nếu cần)
    const requireEdit = this.reflector.get<boolean>('requireEdit', context.getHandler());

    // Kiểm tra quyền truy cập
    this.tasksService.checkPermission(task, user, requireEdit); // Truyền user (object) thay vì user.id

    return true; // Nếu không throw exception, tức là có quyền
  }
}