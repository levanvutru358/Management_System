import { Attachment, Subtask } from "../types/task";
import api from "./api"; // Axios instance

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "Todo" | "Doing" | "Done" | "Archived";
  priority: "Low" | "Medium" | "High";
  subtasks?: Subtask[];
  attachments?: Attachment[];
  startDate?: string;
  deadline?: string;
  assignedTo?: number;
  listId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// 📥 Get all tasks
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  return response.data;
};

// 📝 Create task (with FormData including files + subtasks)
export const createTask = async (formData: FormData): Promise<Task> => {
  const response = await api.post("/tasks", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 🛠 Update task (with FormData including files + subtasks)
export const updateTask = async (
  id: number,
  formData: FormData
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 🗑 Delete task
export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// ✅ Toggle subtask status (completed/uncompleted)
export const updateSubtaskStatus = async (
  subtaskId: number,
  completed: boolean
): Promise<void> => {
  await api.patch(`/subtasks/${subtaskId}`, { completed });
};

// 👤 Assign task to a user
export const assignTask = async (
  id: number,
  assignedUserId: number
): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, { assignedUserId });
  return response.data;
};

// 👥 Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};
