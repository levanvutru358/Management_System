import { IsInt } from 'class-validator';

export class AssignTaskDto {
  @IsInt({ message: 'assignedUserId must be an integer number' })
  assignedUserId: number;
}