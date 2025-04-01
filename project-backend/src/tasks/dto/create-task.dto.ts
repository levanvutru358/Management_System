export class CreateTaskDto {
    title: string;
    description: string;
    status: string;
    dueDate?: string;
    priority: string;
    userId: number;
  }