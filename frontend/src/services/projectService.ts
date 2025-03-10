import api from './api';
import { Project } from '../types';

export const projectService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/projects');
    return response.data.data;
  },

  // Get a single project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data.data;
  },

  // Create a new project
  createProject: async (
    project: Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> => {
    const response = await api.post('/api/projects', project);
    return response.data.data;
  },

  // Update a project
  updateProject: async (
    id: string,
    project: Partial<Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<Project> => {
    const response = await api.put(`/api/projects/${id}`, project);
    return response.data.data;
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
};
