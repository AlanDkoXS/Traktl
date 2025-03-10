import api from './api';
import { Project } from '../types';

export const projectService = {
	// Get all projects
	getProjects: async (): Promise<Project[]> => {
		try {
			console.log('Fetching projects...');
			const response = await api.get('/projects');
			console.log('Projects response:', response.data);

			// Handle different response formats
			let projects;
			if (Array.isArray(response.data)) {
				projects = response.data;
			} else if (Array.isArray(response.data.data)) {
				projects = response.data.data;
			} else {
				console.error('Unexpected projects response format:', response.data);
				return [];
			}

			return projects;
		} catch (error) {
			console.error('Error fetching projects:', error);
			throw error;
		}
	},

	// Get a single project by ID
	getProject: async (id: string): Promise<Project> => {
		try {
			const response = await api.get(`/projects/${id}`);

			// Handle different response formats
			let project;
			if (response.data.data) {
				project = response.data.data;
			} else {
				project = response.data;
			}

			return project;
		} catch (error) {
			console.error('Error fetching project:', error);
			throw error;
		}
	},

	// Create a new project
	createProject: async (
		project: Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>
	): Promise<Project> => {
		try {
			const response = await api.post('/projects', project);

			// Handle different response formats
			let newProject;
			if (response.data.data) {
				newProject = response.data.data;
			} else {
				newProject = response.data;
			}

			return newProject;
		} catch (error) {
			console.error('Error creating project:', error);
			throw error;
		}
	},

	// Update a project
	updateProject: async (
		id: string,
		project: Partial<Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
	): Promise<Project> => {
		try {
			const response = await api.put(`/projects/${id}`, project);

			// Handle different response formats
			let updatedProject;
			if (response.data.data) {
				updatedProject = response.data.data;
			} else {
				updatedProject = response.data;
			}

			return updatedProject;
		} catch (error) {
			console.error('Error updating project:', error);
			throw error;
		}
	},

	// Delete a project
	deleteProject: async (id: string): Promise<void> => {
		try {
			await api.delete(`/projects/${id}`);
		} catch (error) {
			console.error('Error deleting project:', error);
			throw error;
		}
	},
};
