import { create } from 'zustand'
import { taskService } from '../services'
import { Task } from '../types'

// Define a
interface ApiError extends Error {
	response?: {
		data?: {
			error?: string
			message?: string
		}
	}
}

interface TaskState {
	tasks: Task[]
	selectedTask: Task | null
	isLoading: boolean
	error: string | null
	fetchTasks: (projectId?: string) => Promise<void>
	fetchTask: (id: string) => Promise<void>
	createTask: (
		task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	) => Promise<void>
	updateTask: (
		id: string,
		task: Partial<Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
	) => Promise<void>
	deleteTask: (id: string) => Promise<void>
	selectTask: (task: Task | null) => void
	clearSelectedTask: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
	tasks: [],
	selectedTask: null,
	isLoading: false,
	error: null,
	fetchTasks: async (projectId) => {
		try {
			set({ isLoading: true, error: null })
			const tasks = await taskService.getTasks(projectId)
			set({ tasks, isLoading: false })
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error:
					apiError.response?.data?.error || 'Failed to fetch tasks',
				isLoading: false,
			})
		}
	},
	fetchTask: async (id: string) => {
		try {
			set({ isLoading: true, error: null })
			const task = await taskService.getTask(id)
			set({ selectedTask: task, isLoading: false })
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error: apiError.response?.data?.error || 'Failed to fetch task',
				isLoading: false,
			})
		}
	},
	createTask: async (task) => {
		try {
			set({ isLoading: true, error: null })
			const newTask = await taskService.createTask(task)
			set((state) => ({
				tasks: [...state.tasks, newTask],
				isLoading: false,
			}))
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error:
					apiError.response?.data?.error || 'Failed to create task',
				isLoading: false,
			})
			throw error
		}
	},
	updateTask: async (id, task) => {
		try {
			set({ isLoading: true, error: null })
			const updatedTask = await taskService.updateTask(id, task)
			set((state) => ({
				tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
				selectedTask:
					state.selectedTask?.id === id
						? updatedTask
						: state.selectedTask,
				isLoading: false,
			}))
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error:
					apiError.response?.data?.error || 'Failed to update task',
				isLoading: false,
			})
			throw error
		}
	},
	deleteTask: async (id) => {
		try {
			set({ isLoading: true, error: null })
			await taskService.deleteTask(id)
			set((state) => ({
				tasks: state.tasks.filter((t) => t.id !== id),
				selectedTask:
					state.selectedTask?.id === id ? null : state.selectedTask,
				isLoading: false,
			}))
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error:
					apiError.response?.data?.error || 'Failed to delete task',
				isLoading: false,
			})
			throw error
		}
	},
	selectTask: (task) => {
		set({ selectedTask: task })
	},
	clearSelectedTask: () => {
		set({ selectedTask: null })
	},
}))
