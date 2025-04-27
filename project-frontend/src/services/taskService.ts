import { Attachment, Subtask, Comment } from "../types/task";
import api from "./api";

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

export interface User {
  id: number;
  name: string;
  email: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  return response.data;
};

export const searchTasks = async (keyword: string): Promise<Task[]> => {
  const response = await api.get("/tasks/search", { params: { keyword } });
  return response.data;
};

export const getTaskStats = async (): Promise<{ total: number; todo: number; inProgress: number; done: number; overdue: number }> => {
  const response = await api.get("/tasks/stats");
  return response.data;
};

export const getTaskComments = async (taskId: number): Promise<Comment[]> => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  console.log("Raw comments data:", response.data); // Log để kiểm tra dữ liệu
  // Chuẩn hóa dữ liệu
  if (!Array.isArray(response.data)) {
    console.error("Expected an array of comments, received:", response.data);
    return [];
  }
  return response.data.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    userId: comment.userId,
    taskId: comment.taskId,
    updatedAt: comment.updatedAt, // Nếu backend trả về updatedAt
  }));
};

export const addTaskComment = async (taskId: number, content: string): Promise<Comment> => {
  const response = await api.post(`/tasks/${taskId}/comments`, { content });
  console.log("Added comment:", response.data); // Log để kiểm tra dữ liệu
  return {
    id: response.data.id,
    content: response.data.content,
    createdAt: response.data.createdAt,
    userId: response.data.userId,
    taskId: response.data.taskId,
    updatedAt: response.data.updatedAt, // Nếu backend trả về updatedAt
  };
};

export const createTask = async (
  task: Omit<Task, "id" | "createdAt" | "updatedAt"> & { files?: File[] }
): Promise<Task> => {
  const formData = new FormData();
  formData.append("title", task.title);
  if (task.description) formData.append("description", task.description);
  if (task.status) formData.append("status", task.status);
  if (task.priority) formData.append("priority", task.priority);
  if (task.dueDate) formData.append("dueDate", task.dueDate);
  if (task.subtasks) formData.append("subtasks", JSON.stringify(task.subtasks));
  if (task.files?.length) {
    task.files.forEach((file) => formData.append("attachments", file));
  }

  const response = await api.post("/tasks", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateTask = async (
  id: number,
  task: Partial<Task> & { files?: File[] }
): Promise<Task> => {
  const formData = new FormData();
  if (task.title) formData.append("title", task.title);
  if (task.description) formData.append("description", task.description);
  if (task.status) formData.append("status", task.status);
  if (task.priority) formData.append("priority", task.priority);
  if (task.dueDate) formData.append("dueDate", task.dueDate);
  if (task.subtasks) formData.append("subtasks", JSON.stringify(task.subtasks));
  if (task.files?.length) {
    task.files.forEach((file) => formData.append("attachments", file));
  }

  const response = await api.put(`/tasks/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const assignTask = async (id: number, assignedUserId: number): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, { userId: assignedUserId });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};