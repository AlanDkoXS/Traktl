import { create } from 'zustand'
import { projectService } from '../services/projectService'
import { Project } from '../types'

interface ProjectState {
	projects: Project[]
	selectedProject: Project | null
	isLoading: boolean
	error: string | null

	fetchProjects: () => Promise<Project[]>
	fetchProject: (id: string) => Promise<Project | null>
	createProject: (
		project: Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	) => Promise<Project>
	updateProject: (
		id: string,
		project: Partial<
			Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	) => Promise<Project>
	deleteProject: (id: string) => Promise<void>
	selectProject: (project: Project | null) => void
	clearSelectedProject: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
	projects: [],
	selectedProject: null,
	isLoading: false,
	error: null,

	fetchProjects: async () => {
		try {
			set({ isLoading: true, error: null })
			const projects = await projectService.getProjects()
			set({ projects, isLoading: false })
			return projects
		} catch (error: any) {
			console.error('Error fetching projects:', error)
			set({
				error: error.message || 'Failed to fetch projects',
				isLoading: false,
			})
			return []
		}
	},

	fetchProject: async (id: string) => {
		// Validate ID
		if (!id || id === 'undefined') {
			console.error('Invalid project ID provided:', id)
			set({
				error: 'Invalid project ID',
				isLoading: false,
				selectedProject: null,
			})
			return null
		}

		try {
			set({ isLoading: true, error: null })

			console.log(`Fetching project with ID: ${id}`)
			const project = await projectService.getProject(id)

			if (!project) {
				console.error('Project not found for ID:', id)
				throw new Error('Project not found')
			}

			console.log('Project fetched successfully:', project)
			set({ selectedProject: project, isLoading: false })
			return project
		} catch (error: any) {
			console.error(`Error fetching project with ID ${id}:`, error)
			set({
				error: error.message || 'Failed to fetch project',
				isLoading: false,
				selectedProject: null,
			})
			return null
		}
	},

	createProject: async (project) => {
		try {
			set({ isLoading: true, error: null })
			const newProject = await projectService.createProject(project)
			set((state) => ({
				projects: [...state.projects, newProject],
				isLoading: false,
			}))
			return newProject
		} catch (error: any) {
			console.error('Error creating project:', error)
			set({
				error: error.message || 'Failed to create project',
				isLoading: false,
			})
			throw error
		}
	},

	updateProject: async (id, project) => {
		try {
			set({ isLoading: true, error: null })
			const updatedProject = await projectService.updateProject(
				id,
				project,
			)
			set((state) => ({
				projects: state.projects.map((p) =>
					p.id === id ? updatedProject : p,
				),
				selectedProject:
					state.selectedProject?.id === id
						? updatedProject
						: state.selectedProject,
				isLoading: false,
			}))
			return updatedProject
		} catch (error: any) {
			console.error('Error updating project:', error)
			set({
				error: error.message || 'Failed to update project',
				isLoading: false,
			})
			throw error
		}
	},

	deleteProject: async (id) => {
		try {
			set({ isLoading: true, error: null })
			await projectService.deleteProject(id)
			set((state) => ({
				projects: state.projects.filter((p) => p.id !== id),
				selectedProject:
					state.selectedProject?.id === id
						? null
						: state.selectedProject,
				isLoading: false,
			}))
		} catch (error: any) {
			console.error('Error deleting project:', error)
			set({
				error: error.message || 'Failed to delete project',
				isLoading: false,
			})
			throw error
		}
	},

	selectProject: (project) => {
		set({ selectedProject: project })
	},

	clearSelectedProject: () => {
		set({ selectedProject: null })
	},
}))
