import api from './api';
import { Task } from '../types/task';
import { Comment } from '../types/comment';

export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'assignedUserId'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const fetchComments = async (taskId: number): Promise<Comment[]> => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const addCommentToTask = async (taskId: number, content: string): Promise<Comment> => {
  const response = await api.post(`/tasks/${taskId}/comments`, { content });
  return response.data;
};