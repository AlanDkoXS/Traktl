/* eslint-disable no-dupe-else-if */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'
import { TimeEntry } from '../types'

const formatTimeEntry = (timeEntry: any): TimeEntry => {
	if (!timeEntry) return timeEntry
	return {
		id: timeEntry._id || timeEntry.id,
		user:
			typeof timeEntry.user === 'object'
				? timeEntry.user._id || timeEntry.user.id
				: timeEntry.user,
		project:
			typeof timeEntry.project === 'object'
				? timeEntry.project._id || timeEntry.project.id
				: timeEntry.project,
		task: timeEntry.task
			? typeof timeEntry.task === 'object'
				? timeEntry.task._id || timeEntry.task.id
				: timeEntry.task
			: undefined,
		tags: Array.isArray(timeEntry.tags)
			? timeEntry.tags.map((tag: any) =>
					typeof tag === 'object' ? tag._id || tag.id : tag,
				)
			: [],
		startTime: new Date(timeEntry.startTime),
		endTime: timeEntry.endTime ? new Date(timeEntry.endTime) : undefined,
		duration: timeEntry.duration || 0,
		notes: timeEntry.notes || '',
		isRunning: timeEntry.isRunning || false,
		createdAt: timeEntry.createdAt
			? new Date(timeEntry.createdAt)
			: new Date(),
		updatedAt: timeEntry.updatedAt
			? new Date(timeEntry.updatedAt)
			: new Date(),
	}
}

const extractData = (response: any) => {
	if (response.data && response.data.data) {
		return response.data.data
	}
	return response.data
}

export const timeEntryService = {
	getTimeEntries: async (
		projectId?: string,
		taskId?: string,
		startDate?: Date,
		endDate?: Date,
		limit?: number,
	): Promise<TimeEntry[]> => {
		try {
			console.log('Fetching time entries with params:', {
				projectId,
				taskId,
				startDate,
				endDate,
				limit,
			})
			let url = '/time-entries'
			const params = new URLSearchParams()
			if (projectId) params.append('projectId', projectId)
			if (taskId) params.append('taskId', taskId)
			if (startDate) params.append('startDate', startDate.toISOString())
			if (endDate) params.append('endDate', endDate.toISOString())
			if (limit) params.append('limit', limit.toString())
			if (params.toString()) {
				url += `?${params.toString()}`
			}
			const response = await api.get(url)
			console.log('Time entries raw response:', response)
			let timeEntries = []
			if (response.data && Array.isArray(response.data.data)) {
				timeEntries = response.data.data
			} else if (
				response.data &&
				response.data.ok &&
				Array.isArray(response.data.data)
			) {
				timeEntries = response.data.data
			} else if (Array.isArray(response.data)) {
				timeEntries = response.data
			} else {
				console.error('Unexpected response format:', response.data)
				return []
			}
			return timeEntries.map(formatTimeEntry)
		} catch (error) {
			console.error('Error fetching time entries:', error)
			throw error
		}
	},

	getTimeEntry: async (id: string): Promise<TimeEntry> => {
		try {
			const response = await api.get(`/time-entries/${id}`)
			const timeEntry = extractData(response)
			return formatTimeEntry(timeEntry)
		} catch (error) {
			console.error('Error fetching time entry:', error)
			throw error
		}
	},

	getRunningTimeEntry: async (): Promise<TimeEntry | null> => {
		try {
			const response = await api.get('/time-entries/running')
			const timeEntry = extractData(response)
			return timeEntry ? formatTimeEntry(timeEntry) : null
		} catch (error) {
			if (
				(error as any).response &&
				(error as any).response.status === 404
			) {
				return null
			}
			console.error('Error fetching running time entry:', error)
			throw error
		}
	},

	createTimeEntry: async (
		timeEntry: Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	): Promise<TimeEntry> => {
		try {
			const response = await api.post('/time-entries', timeEntry)
			const newTimeEntry = extractData(response)
			return formatTimeEntry(newTimeEntry)
		} catch (error) {
			console.error('Error creating time entry:', error)
			throw error
		}
	},

	startTimeEntry: async (timeEntryData: {
		project: string
		task?: string
		tags?: string[]
		notes?: string
	}): Promise<TimeEntry> => {
		try {
			const response = await api.post(
				'/time-entries/start',
				timeEntryData,
			)
			const newTimeEntry = extractData(response)
			return formatTimeEntry(newTimeEntry)
		} catch (error) {
			console.error('Error starting time entry:', error)
			throw error
		}
	},

	stopTimeEntry: async (additionalData?: {
		notes?: string
		tags?: string[]
	}): Promise<TimeEntry> => {
		try {
			const response = await api.post(
				'/time-entries/stop',
				additionalData || {},
			)
			const stoppedTimeEntry = extractData(response)
			return formatTimeEntry(stoppedTimeEntry)
		} catch (error) {
			console.error('Error stopping time entry:', error)
			throw error
		}
	},

	updateTimeEntry: async (
		id: string,
		timeEntry: Partial<
			Omit<TimeEntry, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	): Promise<TimeEntry> => {
		try {
			const response = await api.put(`/time-entries/${id}`, timeEntry)
			const updatedTimeEntry = extractData(response)
			return formatTimeEntry(updatedTimeEntry)
		} catch (error) {
			console.error('Error updating time entry:', error)
			throw error
		}
	},

	deleteTimeEntry: async (id: string): Promise<void> => {
		try {
			await api.delete(`/time-entries/${id}`)
		} catch (error) {
			console.error('Error deleting time entry:', error)
			throw error
		}
	},
}

export default timeEntryService
