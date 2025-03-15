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

// Helper function to safely format date strings or Date objects without blocking UI
const formatDateSafely = (date: Date | string | undefined, isEndDate = false): Date | undefined => {
	if (!date) return undefined;
	
	// If already a valid Date object, return it
	if (date instanceof Date && !isNaN(date.getTime())) {
		return date;
	}
	
	// If it's a string without time portion
	if (typeof date === 'string') {
		try {
			// Add time portion based on whether it's start or end date
			const timeString = isEndDate ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
			if (!date.includes('T')) {
				return new Date(date + timeString);
			}
			// Already has time portion
			return new Date(date);
		} catch (err) {
			console.warn('Invalid date format:', date);
			return undefined;
		}
	}
	
	return undefined;
};

export const useTimeEntryStore = create<TimeEntryState>((set, get) => ({
	timeEntries: [],
	selectedTimeEntry: null,
	isLoading: false,
	error: null,

	fetchTimeEntries: async (projectId, taskId, startDate, endDate) => {
		console.log('fetchTimeEntries called with params:', { projectId, taskId, startDate, endDate });
		try {
			set({ isLoading: true, error: null });

			// Format dates without blocking UI
			const formattedStartDate = formatDateSafely(startDate);
			const formattedEndDate = formatDateSafely(endDate, true);

			const timeEntries = await timeEntryService.getTimeEntries(
				projectId,
				taskId,
				formattedStartDate,
				formattedEndDate
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
	
	// Método para añadir una entrada directamente al store sin fetch
	addNewTimeEntry: (timeEntry) => {
		set((state) => ({
			timeEntries: [timeEntry, ...state.timeEntries]
		}));
	},
}));
