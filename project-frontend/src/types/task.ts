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

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string; // Thêm updatedAt từ backend
  userId: number;
  taskId: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "Todo" | "InProgress" | "Done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignedUserId?: number;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}