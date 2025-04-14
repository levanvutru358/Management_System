export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}
export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  priority: "low" | "medium" | "high";
  userId: number;
  assignedUserId: number | null;
}
