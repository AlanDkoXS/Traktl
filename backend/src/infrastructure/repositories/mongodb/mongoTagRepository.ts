import { Tag, TagEntity } from '../../../domain/entities/tag.entity'
import { TagRepository } from '../../../domain/repositories/tagRepository.interface'
import { ITag, Tag as TagModel } from '../../../data/mongodb/models/tag.model'
import mongoose from 'mongoose'

export class MongoTagRepository implements TagRepository {
	async create(tag: TagEntity): Promise<Tag> {
		const newTag = new TagModel(tag)
		await newTag.save()
		return {
			...newTag.toObject(),
			_id: newTag._id?.toString() || '',
			user: newTag.user.toString(),
		}
	}

	async findById(id: string): Promise<Tag | null> {
		const tag = await TagModel.findById(id)
		if (!tag) return null

		return {
			...tag.toObject(),
			_id: tag._id?.toString() || '',
			user: tag.user.toString(),
		}
	}

	async update(id: string, tag: Partial<TagEntity>): Promise<Tag | null> {
		const updatedTag = await TagModel.findByIdAndUpdate(
			id,
			{ ...tag, updatedAt: new Date() },
			{ new: true },
		)

		if (!updatedTag) return null

		return {
			...updatedTag.toObject(),
			_id: updatedTag._id?.toString() || '',
			user: updatedTag.user.toString(),
		}
	}

	async delete(id: string): Promise<boolean> {
		const result = await TagModel.findByIdAndDelete(id)
		return !!result
	}

	async listByUser(userId: string, page = 1, limit = 10): Promise<Tag[]> {
		const skip = (page - 1) * limit
		const tags = await TagModel.find({ user: userId })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })

		return tags.map((tag) => ({
			...tag.toObject(),
			_id: tag._id?.toString() || '',
			user: tag.user.toString(),
		}))
	}

	async findByCriteria(criteria: Partial<TagEntity>): Promise<Tag[]> {
		const tags = await TagModel.find(criteria)
		return tags.map((tag) => ({
			...tag.toObject(),
			_id: tag._id?.toString() || '',
			user: tag.user.toString(),
		}))
	}

	async countByUser(userId: string): Promise<number> {
		return await TagModel.countDocuments({ user: userId })
	}
}
