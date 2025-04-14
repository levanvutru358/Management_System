import { CreateSubtaskDto } from './create-subtask.dto';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
  subtasks?: CreateSubtaskDto[];
}
