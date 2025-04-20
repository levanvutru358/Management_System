import api from './api';
import { Report } from '../types/report';

export const getReports = async (): Promise<Report[]> => {
  const response = await api.get('/reports'); // Giả định có API này
  return response.data;
};