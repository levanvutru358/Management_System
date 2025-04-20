import api from "./api";

export interface Subtask {
  id?: number;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: number;
  filename: string;
  path: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  userId: number;
  assignedUserId: number | null;
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// GET all tasks
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  return response.data;
};

// CREATE task with FormData (includes files and subtasks)
export const createTask = async (formData: FormData): Promise<Task> => {
  const response = await api.post("/tasks", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// UPDATE task with FormData (includes files and subtasks)
export const updateTask = async (
  id: number,
  formData: FormData
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// DELETE task
export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// ASSIGN task to user
export const assignTask = async (
  id: number,
  assignedUserId: number
): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, { assignedUserId });
  return response.data;
};

// GET all users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};
