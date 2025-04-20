import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentInputDto {
  @IsString()
  filename: string;

  @IsString()
  path: string;
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
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subtasks?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];

  @IsOptional()
  @IsNumber()
  userId?: number;
}
