import api from './api';
import { Task } from '../types';

// Helper to transform MongoDB _id to id in our frontend
const formatTask = (task: any): Task => {
  if (!task) return task;
  
  return {
    id: task._id || task.id,
    name: task.name,
    description: task.description || '',
    project: task.project?._id || task.project || '',
    status: task.status || 'pending',
    user: task.user?._id || task.user || '',
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
  };
};

export const taskService = {
	// Get all tasks
	getTasks: async (projectId?: string): Promise<Task[]> => {
		try {
			console.log('Fetching tasks...');
			const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
			const response = await api.get(url);
			console.log('Tasks response:', response.data);

			// Handle different response formats
			let tasks = [];
			if (Array.isArray(response.data)) {
				tasks = response.data;
			} else if (Array.isArray(response.data.data)) {
				tasks = response.data.data;
			} else {
				console.error('Unexpected tasks response format:', response.data);
				return [];
			}

			// Format each task to handle _id to id conversion
			return tasks.map(formatTask);
		} catch (error) {
			console.error('Error fetching tasks:', error);
			throw error;
		}
	},

	// Get a single task by ID
	getTask: async (id: string): Promise<Task> => {
		try {
			console.log(`Fetching task with id: ${id}`);
			const response = await api.get(`/tasks/${id}`);
			console.log('Task response:', response.data);

			// Handle different response formats
			let task;
			if (response.data.data) {
				task = response.data.data;
			} else {
				task = response.data;
			}

			return formatTask(task);
		} catch (error) {
			console.error('Error fetching task:', error);
			throw error;
		}
	},

	// Create a new task
	createTask: async (
		task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>
	): Promise<Task> => {
		try {
			console.log('Creating task with data:', task);
			const response = await api.post('/tasks', task);

			// Handle different response formats
			let newTask;
			if (response.data.data) {
				newTask = response.data.data;
			} else {
				newTask = response.data;
			}

			return formatTask(newTask);
		} catch (error) {
			console.error('Error creating task:', error);
			throw error;
		}
	},

	// Update a task
	updateTask: async (
		id: string,
		task: Partial<Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
	): Promise<Task> => {
		try {
			console.log(`Updating task ${id} with data:`, task);
			const response = await api.put(`/tasks/${id}`, task);

			// Handle different response formats
			let updatedTask;
			if (response.data.data) {
				updatedTask = response.data.data;
			} else {
				updatedTask = response.data;
			}

			return formatTask(updatedTask);
		} catch (error) {
			console.error('Error updating task:', error);
			throw error;
		}
	},

	// Delete a task
	deleteTask: async (id: string): Promise<void> => {
		try {
			console.log(`Deleting task with id: ${id}`);
			await api.delete(`/tasks/${id}`);
		} catch (error) {
			console.error('Error deleting task:', error);
			throw error;
		}
	},
};
