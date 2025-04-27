import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // logic xác thực
    const request = context.switchToHttp().getRequest();
    return !!request.user; // hoặc kiểm tra token,...
  }
}
