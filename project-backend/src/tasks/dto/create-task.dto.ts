import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentInputDto {
  @IsString()
  filename: string;

  @IsString()
  path: string;
}

export class SubtaskInputDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsEnum(['Todo', 'InProgress', 'Done'])
  status?: 'Todo' | 'InProgress' | 'Done';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtaskInputDto)
  subtasks?: SubtaskInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];

  @IsOptional()
  @IsNumber()
  assignedUserId?: number;
}