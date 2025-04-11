import { create } from 'zustand'
import { tagService } from '../services/tagService'
import { Tag } from '../types'

interface ApiError extends Error {
	response?: {
		data?: {
			message?: string
		}
	}
}

interface TagState {
	tags: Tag[]
	selectedTag: Tag | null
	isLoading: boolean
	error: string | null
	fetchTags: () => Promise<Tag[]>
	fetchTag: (id: string) => Promise<Tag | null>
	createTag: (
		tag: Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	) => Promise<Tag>
	updateTag: (
		id: string,
		tag: Partial<Omit<Tag, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
	) => Promise<Tag>
	deleteTag: (id: string) => Promise<void>
	selectTag: (tag: Tag | null) => void
	clearSelectedTag: () => void
}

export const useTagStore = create<TagState>((set) => ({
	tags: [],
	selectedTag: null,
	isLoading: false,
	error: null,
	fetchTags: async () => {
		try {
			set({ isLoading: true, error: null })
			const tags = await tagService.getTags()
			set({ tags, isLoading: false })
			return tags
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Error fetching tags:', error)
			set({
				error: apiError.message || 'Failed to fetch tags',
				isLoading: false,
			})
			return []
		}
	},
	fetchTag: async (id: string) => {
		if (!id || id === 'undefined') {
			set({
				error: 'Invalid tag ID',
				isLoading: false,
				selectedTag: null,
			})
			return null
		}
		try {
			set({ isLoading: true, error: null })
			const tag = await tagService.getTag(id)
			if (!tag) throw new Error('Tag not found')
			set({ selectedTag: tag, isLoading: false })
			return tag
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error: apiError.message || 'Failed to fetch tag',
				isLoading: false,
				selectedTag: null,
			})
			return null
		}
	},
	createTag: async (tag) => {
		try {
			set({ isLoading: true, error: null })
			const newTag = await tagService.createTag(tag)
			set((state) => ({
				tags: [...state.tags, newTag],
				isLoading: false,
			}))
			return newTag
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error: apiError.message || 'Failed to create tag',
				isLoading: false,
			})
			throw error
		}
	},
	updateTag: async (id, tag) => {
		try {
			set({ isLoading: true, error: null })
			const updatedTag = await tagService.updateTag(id, tag)
			set((state) => ({
				tags: state.tags.map((t) => (t.id === id ? updatedTag : t)),
				selectedTag:
					state.selectedTag?.id === id
						? updatedTag
						: state.selectedTag,
				isLoading: false,
			}))
			return updatedTag
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error: apiError.message || 'Failed to update tag',
				isLoading: false,
			})
			throw error
		}
	},
	deleteTag: async (id) => {
		try {
			set({ isLoading: true, error: null })
			await tagService.deleteTag(id)
			set((state) => ({
				tags: state.tags.filter((t) => t.id !== id),
				selectedTag:
					state.selectedTag?.id === id ? null : state.selectedTag,
				isLoading: false,
			}))
		} catch (error: unknown) {
			const apiError = error as ApiError
			set({
				error: apiError.message || 'Failed to delete tag',
				isLoading: false,
			})
			throw error
		}
	},
	selectTag: (tag) => set({ selectedTag: tag }),
	clearSelectedTag: () => set({ selectedTag: null }),
}))
