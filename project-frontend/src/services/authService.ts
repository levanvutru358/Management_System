import api from './api';

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (user: { email: string; password: string; name: string }) => {
  const response = await api.post('/auth/register', user);
  return response.data;
};