import api from './api'
import { Project } from '../types'

// Helper to transform MongoDB _id to id in our frontend
const formatProject = (
	project: Partial<Project> & { _id?: string; user?: { _id?: string } },
): Project => {
	if (!project) return project

	return {
		id: project._id || project.id || '',
		name: project.name || '',
		description: project.description || '',
		color: project.color || '#3b82f6',
		client: project.client || undefined,
		status: project.status || 'active',
		user: project.user?._id || project.user || '',
		createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
		updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
	}
}

export const projectService = {
	// Get all projects
	getProjects: async (): Promise<Project[]> => {
		try {
			console.log('Fetching projects...')
			const response = await api.get('/projects')
			console.log('Projects response:', response.data)

			// Handle different response formats
			let projects = []
			if (Array.isArray(response.data)) {
				projects = response.data
			} else if (Array.isArray(response.data.data)) {
				projects = response.data.data
			} else {
				console.error(
					'Unexpected projects response format:',
					response.data,
				)
				return []
			}

			// Format each project to handle _id to id conversion
			return projects.map(formatProject)
		} catch (error) {
			console.error('Error fetching projects:', error)
			throw error
		}
	},

	// Get a single project by ID
	getProject: async (id: string): Promise<Project> => {
		try {
			console.log(`Fetching project with id: ${id}`)
			const response = await api.get(`/projects/${id}`)
			console.log('Project response:', response.data)

			// Handle different response formats
			let project
			if (response.data.data) {
				project = response.data.data
			} else {
				project = response.data
			}

			return formatProject(project)
		} catch (error) {
			console.error('Error fetching project:', error)
			throw error
		}
	},

	// Create a new project
	createProject: async (
		project: Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	): Promise<Project> => {
		try {
			// Set client to null if empty string
			const projectData = { ...project }
			if (projectData.client === '') {
				projectData.client = null
			}

			console.log('Creating project with data:', projectData)
			const response = await api.post('/projects', projectData)

			// Handle different response formats
			let newProject
			if (response.data.data) {
				newProject = response.data.data
			} else {
				newProject = response.data
			}

			return formatProject(newProject)
		} catch (error) {
			console.error('Error creating project:', error)
			throw error
		}
	},

	// Update a project
	updateProject: async (
		id: string,
		project: Partial<
			Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	): Promise<Project> => {
		try {
			// Set client to null if empty string
			const projectData = { ...project }
			if (projectData.client === '') {
				projectData.client = null
			}

			console.log(`Updating project ${id} with data:`, projectData)
			const response = await api.put(`/projects/${id}`, projectData)

			// Handle different response formats
			let updatedProject
			if (response.data.data) {
				updatedProject = response.data.data
			} else {
				updatedProject = response.data
			}

			return formatProject(updatedProject)
		} catch (error) {
			console.error('Error updating project:', error)
			throw error
		}
	},

	// Delete a project
	deleteProject: async (id: string): Promise<void> => {
		try {
			console.log(`Deleting project with id: ${id}`)
			await api.delete(`/projects/${id}`)
		} catch (error) {
			console.error('Error deleting project:', error)
			throw error
		}
	},
}
