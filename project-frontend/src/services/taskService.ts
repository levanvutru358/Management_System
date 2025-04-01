import api from './api';
import { Task } from '../types/task';

export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'assignedUserId'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};