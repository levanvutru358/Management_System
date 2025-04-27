import { IsInt } from 'class-validator';

export class AssignTaskDto {
  @IsInt()
  assignedUserId: number;
}