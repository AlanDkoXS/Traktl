import { create } from 'zustand'
import { timeEntryService } from '../services/timeEntryService'
import { TimeEntry } from '../types'

interface TimeEntryState {
	timeEntries: TimeEntry[]
	selectedTimeEntry: TimeEntry | null
	isLoading: boolean
	error: string | null

	fetchTimeEntries: (
		projectId?: string,
		taskId?: string,
		startDate?: Date | string,
		endDate?: Date | string,
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

	selectTimeEntry: (timeEntry: TimeEntry | null) => void

	clearSelectedTimeEntry: () => void

	addNewTimeEntry: (timeEntry: TimeEntry) => void
}

// Función auxiliar para formatear fechas
const formatDateSafely = (
	date: Date | string | undefined,
): Date | undefined => {
	if (!date) return undefined

	if (date instanceof Date) {
		return isNaN(date.getTime()) ? undefined : date
	}

	if (typeof date === 'string') {
		try {
			// Si es una fecha ISO (contiene 'T')
			if (date.includes('T')) {
				const parsedDate = new Date(date)
				return isNaN(parsedDate.getTime()) ? undefined : parsedDate
			} else {
				// Si es una fecha simple (YYYY-MM-DD)
				const startOfDay = new Date(`${date}T00:00:00`)
				return isNaN(startOfDay.getTime()) ? undefined : startOfDay
			}
		} catch {
			return undefined
		}
	}

	return undefined
}

// Crear el store
const timeEntryStore = create<TimeEntryState>((set) => ({
	timeEntries: [],
	selectedTimeEntry: null,
	isLoading: false,
	error: null,

	fetchTimeEntries: async (projectId, taskId, startDate, endDate) => {
		console.log('fetchTimeEntries called with params:', {
			projectId,
			taskId,
			startDate,
			endDate,
		})

		try {
			// Set loading state first to provide immediate feedback
			set({ isLoading: true, error: null })

			// Formatear las fechas de manera segura
			const formattedStartDate = formatDateSafely(startDate)

			// Para la fecha final, si es una cadena sin 'T', queremos establecerla al final del día
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
			set({ selectedTimeEntry: timeEntry, isLoading: false })
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
				selectedTimeEntry:
					state.selectedTimeEntry?.id === id
						? updatedTimeEntry
						: state.selectedTimeEntry,
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
			set((state) => ({
				timeEntries: state.timeEntries.filter((te) => te.id !== id),
				selectedTimeEntry:
					state.selectedTimeEntry?.id === id
						? null
						: state.selectedTimeEntry,
				isLoading: false,
			}))
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to delete time entry'
			set({
				error: errorMessage,
				isLoading: false,
			})
			throw error
		}
	},

	selectTimeEntry: (timeEntry) => {
		set({ selectedTimeEntry: timeEntry })
	},

	clearSelectedTimeEntry: () => {
		set({ selectedTimeEntry: null })
	},

	// Método para añadir una entrada directamente al store sin fetch
	addNewTimeEntry: (timeEntry) => {
		set((state) => ({
			timeEntries: [timeEntry, ...state.timeEntries],
		}))
	},
}))

// Exportar de dos maneras: default y como variable nombrada
export default timeEntryStore
export const useTimeEntryStore = timeEntryStore
