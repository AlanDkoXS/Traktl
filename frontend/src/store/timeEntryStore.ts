import { create } from 'zustand'
import { timeEntryService } from '../services/timeEntryService'
import { TimeEntry } from '../types'

interface TimeEntryState {
	timeEntries: TimeEntry[]
	selectedTimeEntries: TimeEntry[]
	isLoading: boolean
	error: string | null

	fetchTimeEntries: (
		projectId?: string,
		taskId?: string,
		startDate?: Date | string,
		endDate?: Date | string,
		limit?: number,
	) => Promise<TimeEntry[]>

	fetchTimeEntry: (id: string) => Promise<TimeEntry | null>

	createTimeEntry: (
		timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	) => Promise<TimeEntry>

	updateTimeEntry: (
		id: string,
		timeEntry: Partial<
			Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	) => Promise<TimeEntry>

	deleteTimeEntry: (id: string) => Promise<void>

	selectTimeEntry: (timeEntry: TimeEntry) => void
	deselectTimeEntry: (timeEntry: TimeEntry) => void
	clearSelectedTimeEntries: () => void

	addNewTimeEntry: (timeEntry: TimeEntry) => void

	clearTimeEntries: () => void
}

// Auxiliar function to safely format dates
const formatDateSafely = (
	date: Date | string | undefined,
): Date | undefined => {
	if (!date) return undefined

	if (date instanceof Date) {
		return isNaN(date.getTime()) ? undefined : date
	}

	if (typeof date === 'string') {
		try {
			// If it's an ISO string, parse it directly
			if (date.includes('T')) {
				const parsedDate = new Date(date)
				return isNaN(parsedDate.getTime()) ? undefined : parsedDate
			} else {
				// If it's a date string without time, set it to the start of the day
				const startOfDay = new Date(`${date}T00:00:00`)
				return isNaN(startOfDay.getTime()) ? undefined : startOfDay
			}
		} catch {
			return undefined
		}
	}

	return undefined
}

// Create the store
const timeEntryStore = create<TimeEntryState>((set) => ({
	timeEntries: [],
	selectedTimeEntries: [],
	isLoading: false,
	error: null,

	fetchTimeEntries: async (projectId, taskId, startDate, endDate, limit) => {
		console.log('fetchTimeEntries called with params:', {
			projectId,
			taskId,
			startDate,
			endDate,
			limit,
		})

		try {
			// Set loading state first to provide immediate feedback
			set({ isLoading: true, error: null })

			// Format start date
			const formattedStartDate = formatDateSafely(startDate)

			// For end date, if it's a date string without time, set it to the end of the day
			let formattedEndDate: Date | undefined
			if (
				endDate &&
				typeof endDate === 'string' &&
				!endDate.includes('T')
			) {
				try {
					formattedEndDate = new Date(`${endDate}T23:59:59.999`)
					if (isNaN(formattedEndDate.getTime())) {
						formattedEndDate = undefined
					}
				} catch {
					formattedEndDate = undefined
				}
			} else {
				formattedEndDate = formatDateSafely(endDate)
			}

			// Make API call with processed dates
			const timeEntries = await timeEntryService.getTimeEntries(
				projectId,
				taskId,
				formattedStartDate,
				formattedEndDate,
				limit,
			)

			console.log('Fetched time entries:', timeEntries.length)
			set({ timeEntries, isLoading: false })
			return timeEntries
		} catch (error) {
			console.error('Error fetching time entries:', error)
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch time entries'
			set({
				error: errorMessage,
				isLoading: false,
			})
			return []
		}
	},

	fetchTimeEntry: async (id: string) => {
		try {
			set({ isLoading: true, error: null })
			const timeEntry = await timeEntryService.getTimeEntry(id)
			set({ selectedTimeEntries: [timeEntry], isLoading: false })
			return timeEntry
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch time entry'
			set({
				error: errorMessage,
				isLoading: false,
			})
			return null
		}
	},

	createTimeEntry: async (timeEntry) => {
		try {
			set({ isLoading: true, error: null })
			const newTimeEntry =
				await timeEntryService.createTimeEntry(timeEntry)
			set((state) => ({
				timeEntries: [newTimeEntry, ...state.timeEntries],
				isLoading: false,
			}))
			return newTimeEntry
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to create time entry'
			set({
				error: errorMessage,
				isLoading: false,
			})
			throw error
		}
	},

	updateTimeEntry: async (id, timeEntry) => {
		try {
			set({ isLoading: true, error: null })
			const updatedTimeEntry = await timeEntryService.updateTimeEntry(
				id,
				timeEntry,
			)
			set((state) => ({
				timeEntries: state.timeEntries.map((te) =>
					te.id === id ? updatedTimeEntry : te,
				),
				selectedTimeEntries: state.selectedTimeEntries.map((te) =>
					te.id === id ? updatedTimeEntry : te,
				),
				isLoading: false,
			}))
			return updatedTimeEntry
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update time entry'
			set({
				error: errorMessage,
				isLoading: false,
			})
			throw error
		}
	},

	deleteTimeEntry: async (id) => {
		try {
			set({ isLoading: true, error: null })
			await timeEntryService.deleteTimeEntry(id)

			// Update the store state
			set((state) => {
				const updatedTimeEntries = state.timeEntries.filter((te) => te.id !== id)
				const updatedSelectedTimeEntries = state.selectedTimeEntries.filter((te) => te.id !== id)

				return {
					timeEntries: updatedTimeEntries,
					selectedTimeEntries: updatedSelectedTimeEntries,
					isLoading: false,
				}
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete time entry'
			set({
				error: errorMessage,
				isLoading: false,
			})
			throw error
		}
	},

	selectTimeEntry: (timeEntry: TimeEntry) => {
		set((state) => ({
			selectedTimeEntries: [...state.selectedTimeEntries, timeEntry],
		}))
	},

	deselectTimeEntry: (timeEntry: TimeEntry) => {
		set((state) => ({
			selectedTimeEntries: state.selectedTimeEntries.filter(
				(entry) => entry.id !== timeEntry.id,
			),
		}))
	},

	clearSelectedTimeEntries: () => {
		set({ selectedTimeEntries: [] })
	},

	// Method to add a new time entry to the store
	addNewTimeEntry: (timeEntry) => {
		set((state) => ({
			timeEntries: [timeEntry, ...state.timeEntries],
		}))
	},

	clearTimeEntries: () => {
		console.log('Clearing all time entries from store');
		set({
			timeEntries: [],
			selectedTimeEntries: [],
			// Mantener otros estados como error o isLoading sin cambios
		});
	},
}))

// Export the store hook
export default timeEntryStore
export const useTimeEntryStore = timeEntryStore
