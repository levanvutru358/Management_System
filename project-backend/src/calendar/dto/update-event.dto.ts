import { IsString, IsDateString, IsOptional, IsInt, IsEnum, Validate } from 'class-validator';
import { EventStatus } from '../entities/event.entity';

// Validator tùy chỉnh để kiểm tra JSON string
class IsJsonString {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.every((email: string) => typeof email === 'string' && email.includes('@'));
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'reminderEmails must be a valid JSON string of email addresses';
  }
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsInt()
  @IsOptional()
  assignedById?: number;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @Validate(IsJsonString)
  @IsOptional()
  reminderEmails?: string; // JSON string, ví dụ: '["email1@example.com", "email2@example.com"]'
}