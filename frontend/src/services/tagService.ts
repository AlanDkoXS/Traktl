import api from './api'
import { Tag } from '../types'

// Helper to transform MongoDB _id to id in our frontend
const formatTag = (tag: {
	_id?: string
	id?: string
	name: string
	color?: string
	user?: string | { _id: string }
	createdAt?: string
	updatedAt?: string
}): Tag => {
	if (!tag) return tag

	return {
		id: tag._id || tag.id || '',
		name: tag.name,
		color: tag.color || '#2ecc71',
		user:
			typeof tag.user === 'object' && tag.user?._id
				? tag.user._id
				: typeof tag.user === 'string'
					? tag.user
					: '',
		createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
		updatedAt: tag.updatedAt ? new Date(tag.updatedAt) : new Date(),
	}
}

export const tagService = {
	getTags: async (): Promise<Tag[]> => {
		try {
			const response = await api.get('/tags')
			console.log('Tags response:', response.data)

			let tags = []
			if (Array.isArray(response.data)) {
				tags = response.data
			} else if (Array.isArray(response.data.data)) {
				tags = response.data.data
			} else {
				console.error('Unexpected tags response format:', response.data)
				return []
			}

			return tags.map(formatTag)
		} catch (error) {
			console.error('Error fetching tags:', error)
			throw error
		}
	},

	getTag: async (id: string): Promise<Tag> => {
		try {
			console.log(`Fetching tag with id: ${id}`)
			const response = await api.get(`/tags/${id}`)
			console.log('Tag response:', response.data)

			let tag
			if (response.data.data) {
				tag = response.data.data
			} else {
				tag = response.data
			}

			return formatTag(tag)
		} catch (error) {
			console.error('Error fetching tag:', error)
			throw error
		}
	},

	createTag: async (
		tag: Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	): Promise<Tag> => {
		try {
			console.log('Creating tag with data:', tag)
			const response = await api.post('/tags', tag)

			let newTag
			if (response.data.data) {
				newTag = response.data.data
			} else {
				newTag = response.data
			}

			return formatTag(newTag)
		} catch (error) {
			console.error('Error creating tag:', error)
			throw error
		}
	},

	updateTag: async (
		id: string,
		tag: Partial<Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
	): Promise<Tag> => {
		try {
			console.log(`Updating tag ${id} with data:`, tag)
			const response = await api.put(`/tags/${id}`, tag)

			let updatedTag
			if (response.data.data) {
				updatedTag = response.data.data
			} else {
				updatedTag = response.data
			}

			return formatTag(updatedTag)
		} catch (error) {
			console.error('Error updating tag:', error)
			throw error
		}
	},

	deleteTag: async (id: string): Promise<void> => {
		try {
			console.log(`Deleting tag with id: ${id}`)
			await api.delete(`/tags/${id}`)
		} catch (error) {
			console.error('Error deleting tag:', error)
			throw error
		}
	},
}
