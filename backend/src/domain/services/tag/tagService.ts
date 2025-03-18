import { TagRepository } from '../../repositories/tagRepository.interface'
import { Tag, TagEntity } from '../../entities/tag.entity'
import { CreateTagDTO } from '../../dtos/tag/create-tag.dto'
import { UpdateTagDTO } from '../../dtos/tag/update-tag.dto'
import { CustomError } from '../../errors/custom.errors'

export class TagService {
	constructor(private readonly tagRepository: TagRepository) {}

	async createTag(userId: string, createTagDto: CreateTagDTO): Promise<Tag> {
		const tagEntity: TagEntity = {
			name: createTagDto.name,
			color: createTagDto.color || '#2ecc71',
			user: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		return await this.tagRepository.create(tagEntity)
	}

	async updateTag(
		userId: string,
		tagId: string,
		updateTagDto: UpdateTagDTO,
	): Promise<Tag> {
		const existingTag = await this.tagRepository.findById(tagId)
		if (!existingTag || existingTag.user.toString() !== userId) {
			throw CustomError.notFound('Tag not found')
		}

		const updatedTag = await this.tagRepository.update(tagId, updateTagDto)
		if (!updatedTag) {
			throw CustomError.internalServer('Error updating tag')
		}

		return updatedTag
	}

	async getTagById(userId: string, tagId: string): Promise<Tag> {
		const tag = await this.tagRepository.findById(tagId)

		if (!tag || tag.user.toString() !== userId) {
			throw CustomError.notFound('Tag not found')
		}

		return tag
	}

	async listTags(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<Tag[]> {
		return await this.tagRepository.listByUser(userId, page, limit)
	}

	async deleteTag(userId: string, tagId: string): Promise<boolean> {
		const existingTag = await this.tagRepository.findById(tagId)
		if (!existingTag || existingTag.user.toString() !== userId) {
			throw CustomError.notFound('Tag not found')
		}

		const deleted = await this.tagRepository.delete(tagId)
		if (!deleted) {
			throw CustomError.internalServer('Error deleting tag')
		}

		return true
	}

	async countUserTags(userId: string): Promise<number> {
		return await this.tagRepository.countByUser(userId)
	}
}
