import { create } from 'zustand';
import { timeEntryService } from '../services';
import { TimeEntry } from '../types';

interface TimeEntryState {
  timeEntries: TimeEntry[];
  selectedTimeEntry: TimeEntry | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTimeEntries: (
    projectId?: string,
    taskId?: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<void>;
  fetchTimeEntry: (id: string) => Promise<void>;
  createTimeEntry: (timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTimeEntry: (id: string, timeEntry: Partial<Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  selectTimeEntry: (timeEntry: TimeEntry | null) => void;
}

export const useTimeEntryStore = create<TimeEntryState>((set, get) => ({
  timeEntries: [],
  selectedTimeEntry: null,
  isLoading: false,
  error: null,
  
  fetchTimeEntries: async (projectId, taskId, startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      const timeEntries = await timeEntryService.getTimeEntries(
        projectId,
        taskId,
        startDate,
        endDate
      );
      set({ timeEntries, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch time entries', 
        isLoading: false 
      });
    }
  },
  
  fetchTimeEntry: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const timeEntry = await timeEntryService.getTimeEntry(id);
      set({ selectedTimeEntry: timeEntry, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch time entry', 
        isLoading: false 
      });
    }
  },
  
  createTimeEntry: async (timeEntry) => {
    try {
      set({ isLoading: true, error: null });
      const newTimeEntry = await timeEntryService.createTimeEntry(timeEntry);
      set(state => ({ 
        timeEntries: [...state.timeEntries, newTimeEntry], 
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create time entry', 
        isLoading: false 
      });
    }
  },
  
  updateTimeEntry: async (id, timeEntry) => {
    try {
      set({ isLoading: true, error: null });
      const updatedTimeEntry = await timeEntryService.updateTimeEntry(id, timeEntry);
      set(state => ({ 
        timeEntries: state.timeEntries.map(te => te.id === id ? updatedTimeEntry : te),
        selectedTimeEntry: state.selectedTimeEntry?.id === id ? updatedTimeEntry : state.selectedTimeEntry,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update time entry', 
        isLoading: false 
      });
    }
  },
  
  deleteTimeEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await timeEntryService.deleteTimeEntry(id);
      set(state => ({ 
        timeEntries: state.timeEntries.filter(te => te.id !== id),
        selectedTimeEntry: state.selectedTimeEntry?.id === id ? null : state.selectedTimeEntry,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete time entry', 
        isLoading: false 
      });
    }
  },
  
  selectTimeEntry: (timeEntry) => {
    set({ selectedTimeEntry: timeEntry });
  }
}));
