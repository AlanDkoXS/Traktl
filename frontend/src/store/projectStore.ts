import { create } from 'zustand';
import { projectService } from '../services/projectService';
import { Project } from '../types';

interface ProjectState {
	projects: Project[];
	selectedProject: Project | null;
	isLoading: boolean;
	error: string | null;

	fetchProjects: () => Promise<void>;
	fetchProject: (id: string) => Promise<void>;
	createProject: (
		project: Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>
	) => Promise<void>;
	updateProject: (
		id: string,
		project: Partial<Omit<Project, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
	) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;
	selectProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
	projects: [],
	selectedProject: null,
	isLoading: false,
	error: null,

	fetchProjects: async () => {
		try {
			set({ isLoading: true, error: null });
			const projects = await projectService.getProjects();
			set({ projects, isLoading: false });
		} catch (error: any) {
			console.error('Error fetching projects:', error);
			set({
				error: error.message || 'Failed to fetch projects',
				isLoading: false,
			});
		}
	},

	fetchProject: async (id: string) => {
		try {
			set({ isLoading: true, error: null });
			const project = await projectService.getProject(id);
			set({ selectedProject: project, isLoading: false });
		} catch (error: any) {
			console.error('Error fetching project:', error);
			set({
				error: error.message || 'Failed to fetch project',
				isLoading: false,
			});
		}
	},

	createProject: async (project) => {
		try {
			set({ isLoading: true, error: null });
			const newProject = await projectService.createProject(project);
			set((state) => ({
				projects: [...state.projects, newProject],
				isLoading: false,
			}));
		} catch (error: any) {
			console.error('Error creating project:', error);
			set({
				error: error.message || 'Failed to create project',
				isLoading: false,
			});
		}
	},

	updateProject: async (id, project) => {
		try {
			set({ isLoading: true, error: null });
			const updatedProject = await projectService.updateProject(id, project);
			set((state) => ({
				projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
				selectedProject:
					state.selectedProject?.id === id ? updatedProject : state.selectedProject,
				isLoading: false,
			}));
		} catch (error: any) {
			console.error('Error updating project:', error);
			set({
				error: error.message || 'Failed to update project',
				isLoading: false,
			});
		}
	},

	deleteProject: async (id) => {
		try {
			set({ isLoading: true, error: null });
			await projectService.deleteProject(id);
			set((state) => ({
				projects: state.projects.filter((p) => p.id !== id),
				selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
				isLoading: false,
			}));
		} catch (error: any) {
			console.error('Error deleting project:', error);
			set({
				error: error.message || 'Failed to delete project',
				isLoading: false,
			});
		}
	},

	selectProject: (project) => {
		set({ selectedProject: project });
	},
}));
