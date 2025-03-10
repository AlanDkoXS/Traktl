import api from './api';
import { TimeEntry } from '../types';

export const timeEntryService = {
  // Get all time entries
  getTimeEntries: async (
    projectId?: string,
    taskId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeEntry[]> => {
    let url = '/api/time-entries';
    const params = new URLSearchParams();
    
    if (projectId) params.append('projectId', projectId);
    if (taskId) params.append('taskId', taskId);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.data;
  },

  // Get a single time entry by ID
  getTimeEntry: async (id: string): Promise<TimeEntry> => {
    const response = await api.get(`/api/time-entries/${id}`);
    return response.data.data;
  },

  // Create a new time entry
  createTimeEntry: async (
    timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<TimeEntry> => {
    const response = await api.post('/api/time-entries', timeEntry);
    return response.data.data;
  },

  // Update a time entry
  updateTimeEntry: async (
    id: string,
    timeEntry: Partial<Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<TimeEntry> => {
    const response = await api.put(`/api/time-entries/${id}`, timeEntry);
    return response.data.data;
  },

  // Delete a time entry
  deleteTimeEntry: async (id: string): Promise<void> => {
    await api.delete(`/api/time-entries/${id}`);
  },
};
