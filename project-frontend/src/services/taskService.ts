import api from './api';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done'; 
  priority: 'low' | 'medium' | 'high'; 
  userId: number;
  assignedUserId: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'assignedUserId'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const assignTask = async (id: number, assignedUserId: number): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign`, { assignedUserId });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};