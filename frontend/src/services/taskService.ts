import api from './api'
import { Task } from '../types'

interface MongoDBTask {
	_id?: string
	id?: string
	name: string
	description?: string
	project?: { _id: string } | string
	status?: string
	user?: { _id: string } | string
	createdAt?: string | Date
	updatedAt?: string | Date
}

// Helper to transform MongoDB _id to id in our frontend
const formatTask = (task: MongoDBTask | null): Task | null => {
	if (!task) return null

	return {
		id: task._id || task.id || '',
		name: task.name,
		description: task.description || '',
		project:
			typeof task.project === 'object'
				? task.project._id
				: task.project || '',
		status: ['pending', 'in-progress', 'completed'].includes(
			task.status || '',
		)
			? (task.status as 'pending' | 'in-progress' | 'completed')
			: 'pending',
		user: typeof task.user === 'object' ? task.user._id : task.user || '',
		createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
		updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
	}
}

interface ApiResponse<T> {
	data: T
}

export const taskService = {
	getTasks: async (projectId?: string): Promise<Task[]> => {
		try {
			console.log('Fetching tasks...')
			const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks'
			const response = await api.get<
				MongoDBTask[] | ApiResponse<MongoDBTask[]>
			>(url)
			console.log('Tasks response:', response.data)

			let tasks: MongoDBTask[] = []
			if (Array.isArray(response.data)) {
				tasks = response.data
			} else if (Array.isArray(response.data.data)) {
				tasks = response.data.data
			} else {
				console.error(
					'Unexpected tasks response format:',
					response.data,
				)
				return []
			}

			return tasks
				.map((task) => formatTask(task))
				.filter((task): task is Task => task !== null)
		} catch (error) {
			console.error('Error fetching tasks:', error)
			throw error
		}
	},

	getTask: async (id: string): Promise<Task> => {
		try {
			console.log(`Fetching task with id: ${id}`)
			const response = await api.get<
				MongoDBTask | ApiResponse<MongoDBTask>
			>(`/tasks/${id}`)
			console.log('Task response:', response.data)

			let task: MongoDBTask
			if ('data' in response.data && response.data.data) {
				task = response.data.data
			} else {
				task = response.data as MongoDBTask
			}

			const formattedTask = formatTask(task)
			if (!formattedTask) {
				throw new Error('Task not found or invalid format')
			}

			return formattedTask
		} catch (error) {
			console.error('Error fetching task:', error)
			throw error
		}
	},

	createTask: async (
		task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	): Promise<Task> => {
		try {
			console.log('Creating task with data:', task)
			const response = await api.post<
				MongoDBTask | ApiResponse<MongoDBTask>
			>('/tasks', task)

			let newTask: MongoDBTask
			if ('data' in response.data && response.data.data) {
				newTask = response.data.data
			} else {
				newTask = response.data as MongoDBTask
			}

			const formattedTask = formatTask(newTask)
			if (!formattedTask) {
				throw new Error('Failed to create task or invalid format')
			}

			return formattedTask
		} catch (error) {
			console.error('Error creating task:', error)
			throw error
		}
	},

	updateTask: async (
		id: string,
		task: Partial<Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
	): Promise<Task> => {
		try {
			console.log(`Updating task ${id} with data:`, task)
			const response = await api.put<
				MongoDBTask | ApiResponse<MongoDBTask>
			>(`/tasks/${id}`, task)

			let updatedTask: MongoDBTask
			if ('data' in response.data && response.data.data) {
				updatedTask = response.data.data
			} else {
				updatedTask = response.data as MongoDBTask
			}

			const formattedTask = formatTask(updatedTask)
			if (!formattedTask) {
				throw new Error('Failed to update task or invalid format')
			}

			return formattedTask
		} catch (error) {
			console.error('Error updating task:', error)
			throw error
		}
	},

	deleteTask: async (id: string): Promise<void> => {
		try {
			console.log(`Deleting task with id: ${id}`)
			await api.delete(`/tasks/${id}`)
		} catch (error) {
			console.error('Error deleting task:', error)
			throw error
		}
	},
}
