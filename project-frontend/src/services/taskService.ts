import { Attachment, Subtask } from "../types/task";
import api from "./api";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: "Todo" | "Doing" | "Done" | "Archived";
  priority?: "Low" | "Medium" | "High";
  checklist?: Subtask[];
  attachments?: Attachment[];
  startDate?: string;
  deadline?: string;
  assignedTo?: number;
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

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  return response.data;
};
export const updateSubtaskStatus = async (
  subtaskId: number,
  completed: boolean
): Promise<void> => {
  await api.patch(`/subtasks/${subtaskId}`, { completed });
};
export const createTask = async (
  task: Omit<Task, "id" | "userId" | "assignedUserId">
): Promise<Task> => {
  const response = await api.post("/tasks", task);
  return response.data;
};

export const updateTask = async (
  id: number,
  task: Partial<Task>
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const assignTask = async (
  id: number,
  assignedUserId: number
): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, { assignedUserId });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};
