import { create } from 'zustand';
import { timeEntryService } from '../services/timeEntryService';
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
	) => Promise<TimeEntry[]>;
	fetchTimeEntry: (id: string) => Promise<TimeEntry | null>;
	createTimeEntry: (
		timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>
	) => Promise<TimeEntry>;
	updateTimeEntry: (
		id: string,
		timeEntry: Partial<Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
	) => Promise<TimeEntry>;
	deleteTimeEntry: (id: string) => Promise<void>;
	selectTimeEntry: (timeEntry: TimeEntry | null) => void;
	clearSelectedTimeEntry: () => void;
	addNewTimeEntry: (timeEntry: TimeEntry) => void;
}

export const useTimeEntryStore = create<TimeEntryState>((set, get) => ({
	timeEntries: [],
	selectedTimeEntry: null,
	isLoading: false,
	error: null,

	fetchTimeEntries: async (projectId, taskId, startDate, endDate) => {
	  console.log('fetchTimeEntries called with params:', { projectId, taskId, startDate, endDate });
    try {
      // Set loading state first to provide immediate feedback
      set({ isLoading: true, error: null });

      // Process date formatting in a non-blocking way
      const processedDates = await Promise.resolve().then(() => {
        let formattedStartDate = startDate;
        let formattedEndDate = endDate;
        
        // Only do processing if needed, using safe checks
        if (startDate && (!(startDate instanceof Date) || isNaN(startDate.getTime()))) {
          if (typeof startDate === 'string') {
            try {
              // Handle ISO dates or simple date strings
              formattedStartDate = startDate.includes('T') 
                ? new Date(startDate) 
                : new Date(`${startDate}T00:00:00`);
            } catch (e) {
              console.warn('Invalid start date format:', startDate);
              formattedStartDate = undefined;
            }
          } else {
            formattedStartDate = undefined;
          }
        }
        
        if (endDate && (!(endDate instanceof Date) || isNaN(endDate.getTime()))) {
          if (typeof endDate === 'string') {
            try {
              // Handle ISO dates or simple date strings
              formattedEndDate = endDate.includes('T') 
                ? new Date(endDate) 
                : new Date(`${endDate}T23:59:59.999`);
            } catch (e) {
              console.warn('Invalid end date format:', endDate);
              formattedEndDate = undefined;
            }
          } else {
            formattedEndDate = undefined;
          }
        }

        return { formattedStartDate, formattedEndDate };
      });

      // Make API call with processed dates
      const timeEntries = await timeEntryService.getTimeEntries(
        projectId,
        taskId,
        processedDates.formattedStartDate,
        processedDates.formattedEndDate
      );

      console.log('Fetched time entries:', timeEntries.length);
      set({ timeEntries, isLoading: false });
      return timeEntries;
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
      set({
        error: error.message || 'Failed to fetch time entries',
        isLoading: false,
      });
      return [];
    }
	},

	fetchTimeEntry: async (id: string) => {
		try {
			set({ isLoading: true, error: null });
			const timeEntry = await timeEntryService.getTimeEntry(id);
			set({ selectedTimeEntry: timeEntry, isLoading: false });
			return timeEntry;
		} catch (error: any) {
			set({
				error: error.message || 'Failed to fetch time entry',
				isLoading: false,
			});
			return null;
		}
	},

	createTimeEntry: async (timeEntry) => {
		try {
			set({ isLoading: true, error: null });
			const newTimeEntry = await timeEntryService.createTimeEntry(timeEntry);
			set((state) => ({
				timeEntries: [newTimeEntry, ...state.timeEntries],
				isLoading: false,
			}));
			return newTimeEntry;
		} catch (error: any) {
			set({
				error: error.message || 'Failed to create time entry',
				isLoading: false,
			});
			throw error;
		}
	},

	updateTimeEntry: async (id, timeEntry) => {
		try {
			set({ isLoading: true, error: null });
			const updatedTimeEntry = await timeEntryService.updateTimeEntry(id, timeEntry);
			set((state) => ({
				timeEntries: state.timeEntries.map((te) => (te.id === id ? updatedTimeEntry : te)),
				selectedTimeEntry:
					state.selectedTimeEntry?.id === id ? updatedTimeEntry : state.selectedTimeEntry,
				isLoading: false,
			}));
			return updatedTimeEntry;
		} catch (error: any) {
			set({
				error: error.message || 'Failed to update time entry',
				isLoading: false,
			});
			throw error;
		}
	},

	deleteTimeEntry: async (id) => {
		try {
			set({ isLoading: true, error: null });
			await timeEntryService.deleteTimeEntry(id);
			set((state) => ({
				timeEntries: state.timeEntries.filter((te) => te.id !== id),
				selectedTimeEntry:
					state.selectedTimeEntry?.id === id ? null : state.selectedTimeEntry,
				isLoading: false,
			}));
		} catch (error: any) {
			set({
				error: error.message || 'Failed to delete time entry',
				isLoading: false,
			});
			throw error;
		}
	},

	selectTimeEntry: (timeEntry) => {
		set({ selectedTimeEntry: timeEntry });
	},

	clearSelectedTimeEntry: () => {
		set({ selectedTimeEntry: null });
	},
	
	// Nuevo método para añadir una entrada directamente al store sin fetch
	addNewTimeEntry: (timeEntry) => {
		set((state) => ({
			timeEntries: [timeEntry, ...state.timeEntries]
		}));
	},
}));
