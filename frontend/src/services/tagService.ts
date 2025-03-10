import api from './api';
import { Tag } from '../types';

export const tagService = {
	// Get all tags
	getTags: async (): Promise<Tag[]> => {
		const response = await api.get('/tags');
		return response.data.data;
	},

	// Get a single tag by ID
	getTag: async (id: string): Promise<Tag> => {
		const response = await api.get(`/tags/${id}`);
		return response.data.data;
	},

	// Create a new tag
	createTag: async (tag: Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Tag> => {
		const response = await api.post('/tags', tag);
		return response.data.data;
	},

	// Update a tag
	updateTag: async (
		id: string,
		tag: Partial<Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
	): Promise<Tag> => {
		const response = await api.put(`/tags/${id}`, tag);
		return response.data.data;
	},

	// Delete a tag
	deleteTag: async (id: string): Promise<void> => {
		await api.delete(`/tags/${id}`);
	},
};
