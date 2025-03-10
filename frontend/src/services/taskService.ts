import api from './api';
import { Task } from '../types';

export const taskService = {
  // Get all tasks
  getTasks: async (projectId?: string): Promise<Task[]> => {
    const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
    const response = await api.get(url);
    return response.data.data;
  },

  // Get a single task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data.data;
  },

  // Create a new task
  createTask: async (
    task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> => {
    const response = await api.post('/api/tasks', task);
    return response.data.data;
  },

  // Update a task
  updateTask: async (
    id: string,
    task: Partial<Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<Task> => {
    const response = await api.put(`/api/tasks/${id}`, task);
    return response.data.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },
};
