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
  files?: File[]; // Add this for file upload
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
  task: Omit<Task, "id" | "userId" | "assignedUserId"> & { files?: File[] }
): Promise<Task> => {
  const formData = new FormData();

  formData.append("title", task.title);
  if (task.description) formData.append("description", task.description);
  if (task.status) formData.append("status", task.status);
  if (task.priority) formData.append("priority", task.priority);
  if (task.deadline) formData.append("deadline", task.deadline);

  if (task.subtasks) {
    formData.append("subtasks", JSON.stringify(task.subtasks));
  }

  if (task.files?.length) {
    task.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await api.post("/tasks", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
  if (task.deadline) formData.append("deadline", task.deadline);

  if (task.subtasks) {
    formData.append("subtasks", JSON.stringify(task.subtasks));
  }

  if (task.files?.length) {
    task.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await api.put(`/tasks/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const assignTask = async (
  id: number,
  assignedUserId: number
): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, {
    userId: assignedUserId,
  });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};
