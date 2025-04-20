// types/Task.ts
export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  taskId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  id: number;
  filename: string;
  url: string;
  taskId?: number;
  uploadedAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: "Todo" | "Doing" | "Done" | "Archived";
  priority?: "Low" | "Medium" | "High";
  checklist?: Subtask[];
  attachments?: Attachment[];
  startDate?: string;
  deadline?: string; // 🔄 Đổi từ `dueDate` thành `deadline`
  assignedTo?: number; // 🔄 Đổi từ `assignedUserId` => `assignedTo`
  listId?: number;
  createdAt?: string;
  updatedAt?: string;
  subtasks?: Subtask[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}
