import mongoose from 'mongoose'
import {
	TimerPreset,
	TimerPresetEntity,
} from '../../../domain/entities/timer-preset.entity'
import { TimerPresetRepository } from '../../../domain/repositories/timerPresetRepository.interface'
import {
	ITimerPreset,
	TimerPreset as TimerPresetModel,
} from '../../../data/mongodb/models/timerPreset.model'

export class MongoTimerPresetRepository implements TimerPresetRepository {
	async create(timerPreset: TimerPresetEntity): Promise<TimerPreset> {
		const newTimerPreset = new TimerPresetModel(timerPreset)
		await newTimerPreset.save()
		return {
			_id: newTimerPreset._id?.toString() || '',
			name: newTimerPreset.name,
			workDuration: newTimerPreset.workDuration,
			breakDuration: newTimerPreset.breakDuration,
			repetitions: newTimerPreset.repetitions,
			user: newTimerPreset.user.toString(),
			createdAt: newTimerPreset.createdAt,
			updatedAt: newTimerPreset.updatedAt,
		}
	}

	async findById(id: string): Promise<TimerPreset | null> {
		const timerPreset = await TimerPresetModel.findById(id)
		if (!timerPreset) return null
		return {
			_id: timerPreset._id?.toString() || '',
			name: timerPreset.name,
			workDuration: timerPreset.workDuration,
			breakDuration: timerPreset.breakDuration,
			repetitions: timerPreset.repetitions,
			user: timerPreset.user.toString(),
			createdAt: timerPreset.createdAt,
			updatedAt: timerPreset.updatedAt,
		}
	}

	async update(
		id: string,
		timerPreset: Partial<TimerPresetEntity>,
	): Promise<TimerPreset | null> {
		const updatedTimerPreset = await TimerPresetModel.findByIdAndUpdate(
			id,
			{ ...timerPreset, updatedAt: new Date() },
			{ new: true },
		)
		if (!updatedTimerPreset) return null
		return {
			_id: updatedTimerPreset._id?.toString() || '',
			name: updatedTimerPreset.name,
			workDuration: updatedTimerPreset.workDuration,
			breakDuration: updatedTimerPreset.breakDuration,
			repetitions: updatedTimerPreset.repetitions,
			user: updatedTimerPreset.user.toString(),
			createdAt: updatedTimerPreset.createdAt,
			updatedAt: updatedTimerPreset.updatedAt,
		}
	}

	async delete(id: string): Promise<boolean> {
		const result = await TimerPresetModel.findByIdAndDelete(id)
		return !!result
	}

	async listByUser(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<TimerPreset[]> {
		const skip = (page - 1) * limit
		const timerPresets = await TimerPresetModel.find({ user: userId })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
		return timerPresets.map((preset) => ({
			_id: preset._id?.toString() || '',
			name: preset.name,
			workDuration: preset.workDuration,
			breakDuration: preset.breakDuration,
			repetitions: preset.repetitions,
			user: preset.user.toString(),
			createdAt: preset.createdAt,
			updatedAt: preset.updatedAt,
		}))
	}

	async findByCriteria(
		criteria: Partial<TimerPresetEntity>,
	): Promise<TimerPreset[]> {
		const timerPresets = await TimerPresetModel.find(criteria)
		return timerPresets.map((preset) => ({
			_id: preset._id?.toString() || '',
			name: preset.name,
			workDuration: preset.workDuration,
			breakDuration: preset.breakDuration,
			repetitions: preset.repetitions,
			user: preset.user.toString(),
			createdAt: preset.createdAt,
			updatedAt: preset.updatedAt,
		}))
	}

	async countByUser(userId: string): Promise<number> {
		return await TimerPresetModel.countDocuments({ user: userId })
	}
}
