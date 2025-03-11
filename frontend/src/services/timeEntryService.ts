import api from './api';
import { TimeEntry } from '../types';

// Helper to transform MongoDB _id to id in our frontend
const formatTimeEntry = (timeEntry: any): TimeEntry => {
  if (!timeEntry) return timeEntry;
  
  return {
    id: timeEntry._id || timeEntry.id,
    user: timeEntry.user._id || timeEntry.user,
    project: timeEntry.project._id || timeEntry.project,
    task: timeEntry.task?._id || timeEntry.task || undefined,
    tags: timeEntry.tags?.map((tag: any) => tag._id || tag) || [],
    startTime: new Date(timeEntry.startTime),
    endTime: timeEntry.endTime ? new Date(timeEntry.endTime) : undefined,
    duration: timeEntry.duration || 0,
    notes: timeEntry.notes || '',
    isRunning: timeEntry.isRunning || false,
    createdAt: timeEntry.createdAt ? new Date(timeEntry.createdAt) : new Date(),
    updatedAt: timeEntry.updatedAt ? new Date(timeEntry.updatedAt) : new Date()
  };
};

export const timeEntryService = {
  // Get all time entries
  getTimeEntries: async (
    projectId?: string,
    taskId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeEntry[]> => {
    try {
      console.log('Fetching time entries...');
      let url = '/time-entries';
      const params = new URLSearchParams();

      if (projectId) params.append('projectId', projectId);
      if (taskId) params.append('taskId', taskId);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      console.log('Time entries response:', response.data);

      // Handle different response formats
      let timeEntries = [];
      if (Array.isArray(response.data)) {
        timeEntries = response.data;
      } else if (Array.isArray(response.data.data)) {
        timeEntries = response.data.data;
      } else {
        console.error('Unexpected time entries response format:', response.data);
        return [];
      }

      return timeEntries.map(formatTimeEntry);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  },

  // Get a single time entry by ID
  getTimeEntry: async (id: string): Promise<TimeEntry> => {
    try {
      console.log(`Fetching time entry with id: ${id}`);
      const response = await api.get(`/time-entries/${id}`);
      console.log('Time entry response:', response.data);

      // Handle different response formats
      let timeEntry;
      if (response.data.data) {
        timeEntry = response.data.data;
      } else {
        timeEntry = response.data;
      }

      return formatTimeEntry(timeEntry);
    } catch (error) {
      console.error('Error fetching time entry:', error);
      throw error;
    }
  },

  // Create a new time entry
  createTimeEntry: async (
    timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<TimeEntry> => {
    try {
      console.log('Creating time entry with data:', timeEntry);
      const response = await api.post('/time-entries', timeEntry);

      // Handle different response formats
      let newTimeEntry;
      if (response.data.data) {
        newTimeEntry = response.data.data;
      } else {
        newTimeEntry = response.data;
      }

      return formatTimeEntry(newTimeEntry);
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  // Update a time entry
  updateTimeEntry: async (
    id: string,
    timeEntry: Partial<Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<TimeEntry> => {
    try {
      console.log(`Updating time entry ${id} with data:`, timeEntry);
      const response = await api.put(`/time-entries/${id}`, timeEntry);

      // Handle different response formats
      let updatedTimeEntry;
      if (response.data.data) {
        updatedTimeEntry = response.data.data;
      } else {
        updatedTimeEntry = response.data;
      }

      return formatTimeEntry(updatedTimeEntry);
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  },

  // Delete a time entry
  deleteTimeEntry: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting time entry with id: ${id}`);
      await api.delete(`/time-entries/${id}`);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  },
};
