import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
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

    if (!taskId || isNaN(taskId)) {
      throw new ForbiddenException('Invalid task ID');
    }

    // Lấy task từ database
    const task = await this.tasksService.findOne(taskId);
    if (!task) {
      throw new ForbiddenException('Task not found');
    }

    // Kiểm tra quyền chỉnh sửa (nếu cần)
    const requireEdit = this.reflector.get<boolean>(
      'requireEdit',
      context.getHandler(),
    );

    // Kiểm tra quyền truy cập
    this.validateTaskPermission(task, user, requireEdit);

    return true; // Nếu không throw exception, tức là có quyền
  }

  /**
   * Hàm kiểm tra quyền truy cập vào task
   * @param task Task cần kiểm tra
   * @param user Người dùng hiện tại
   * @param requireEdit Yêu cầu quyền chỉnh sửa hay không
   */
  private validateTaskPermission(
    task: any,
    user: any,
    requireEdit: boolean,
  ): void {
    const isOwner = task.user?.id === user.id;
    const isAssigned = task.assignedUserId === user.id;

    if (!isOwner && !isAssigned) {
      throw new ForbiddenException(
        'You do not have permission to access this task',
      );
    }

    if (requireEdit && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to edit this task',
      );
    }
  }
}
