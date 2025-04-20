export interface Subtask {
  id: number;
  title: string;
  isCompleted: boolean;
}

export interface Attachment {
  id: number;
  filename: string;
  url: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done" | "archived";
  priority: "low" | "medium" | "high";
  startDate?: string;
  deadline?: string;
  assignedTo?: string;
  subtasks?: Subtask[];
  attachments?: Attachment[];
}
