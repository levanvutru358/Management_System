import { IsString, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';


export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'InProgress',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsInt()
  @IsOptional()
  assignedUserId?: number;
}