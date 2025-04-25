import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['Todo', 'InProgress', 'Done'])
  @IsOptional()
  status?: 'Todo' | 'InProgress' | 'Done';

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @IsInt()
  @IsOptional()
  assignedUserId?: number;
}