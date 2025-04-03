import { TimerPresetRepository } from '../../repositories/timerPresetRepository.interface'
import {
	TimerPreset,
	TimerPresetEntity,
} from '../../entities/timer-preset.entity'
import { CreateTimerPresetDTO } from '../../dtos/timerPreset/create-timer-preset.dto'
import { UpdateTimerPresetDTO } from '../../dtos/timerPreset/update-timer-preset.dto'
import { CustomError } from '../../errors/custom.errors'

export class TimerPresetService {
	constructor(
		private readonly timerPresetRepository: TimerPresetRepository,
	) {}

	async createTimerPreset(
		userId: string,
		createTimerPresetDto: CreateTimerPresetDTO,
	): Promise<TimerPreset> {
		const timerPresetEntity: TimerPresetEntity = {
			name: createTimerPresetDto.name,
			workDuration: createTimerPresetDto.workDuration,
			breakDuration: createTimerPresetDto.breakDuration,
			repetitions: createTimerPresetDto.repetitions || 1,
			user: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		return await this.timerPresetRepository.create(timerPresetEntity)
	}

	async updateTimerPreset(
		userId: string,
		timerPresetId: string,
		updateTimerPresetDto: UpdateTimerPresetDTO,
	): Promise<TimerPreset> {
		const existingTimerPreset =
			await this.timerPresetRepository.findById(timerPresetId)
		if (
			!existingTimerPreset ||
			existingTimerPreset.user.toString() !== userId
		) {
			throw CustomError.notFound('Timer preset not found')
		}

		const updatedTimerPreset = await this.timerPresetRepository.update(
			timerPresetId,
			updateTimerPresetDto,
		)

		if (!updatedTimerPreset) {
			throw CustomError.internalServer('Error updating timer preset')
		}

		return updatedTimerPreset
	}

	async getTimerPresetById(
		userId: string,
		timerPresetId: string,
	): Promise<TimerPreset> {
		const timerPreset =
			await this.timerPresetRepository.findById(timerPresetId)

		if (!timerPreset || timerPreset.user.toString() !== userId) {
			throw CustomError.notFound('Timer preset not found')
		}

		return timerPreset
	}

	async listTimerPresets(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<TimerPreset[]> {
		return await this.timerPresetRepository.listByUser(userId, page, limit)
	}

	async deleteTimerPreset(
		userId: string,
		timerPresetId: string,
	): Promise<boolean> {
		const existingTimerPreset =
			await this.timerPresetRepository.findById(timerPresetId)
		if (
			!existingTimerPreset ||
			existingTimerPreset.user.toString() !== userId
		) {
			throw CustomError.notFound('Timer preset not found')
		}

		const deleted = await this.timerPresetRepository.delete(timerPresetId)
		if (!deleted) {
			throw CustomError.internalServer('Error deleting timer preset')
		}

		return true
	}

	async countUserTimerPresets(userId: string): Promise<number> {
		return await this.timerPresetRepository.countByUser(userId)
	}

	async syncTimerSettings(
		userId: string,
		settings: {
			workDuration: number
			breakDuration: number
			repetitions: number
		}
	): Promise<void> {
		try {
			console.log(`[TimerPresetService] Starting sync for user ${userId} with settings:`, settings)

			const existingPresets = await this.timerPresetRepository.findByCriteria({
				user: userId,
				name: 'Default Settings'
			})

			if (existingPresets.length > 0) {
				console.log(`[TimerPresetService] Found ${existingPresets.length} Default Settings presets for user ${userId}`)

				const mainPreset = existingPresets[0]
				console.log(`[TimerPresetService] Updating main Default Settings preset:`, {
					presetId: mainPreset._id,
					currentSettings: {
						workDuration: mainPreset.workDuration,
						breakDuration: mainPreset.breakDuration,
						repetitions: mainPreset.repetitions
					}
				})

				const updatedPreset = await this.timerPresetRepository.update(mainPreset._id, {
					workDuration: settings.workDuration,
					breakDuration: settings.breakDuration,
					repetitions: settings.repetitions,
					updatedAt: new Date()
				})

				if (!updatedPreset) {
					throw CustomError.internalServer('Error updating timer preset')
				}

				if (existingPresets.length > 1) {
					console.log(`[TimerPresetService] Removing ${existingPresets.length - 1} duplicate Default Settings presets`)
					for (let i = 1; i < existingPresets.length; i++) {
						await this.timerPresetRepository.delete(existingPresets[i]._id)
					}
				}

				console.log(`[TimerPresetService] Updated Default Settings preset:`, {
					presetId: updatedPreset._id,
					newSettings: {
						workDuration: updatedPreset.workDuration,
						breakDuration: updatedPreset.breakDuration,
						repetitions: updatedPreset.repetitions
					}
				})
			} else {
				console.log(`[TimerPresetService] No Default Settings preset found for user ${userId}, creating new one`)

				const newPreset = await this.timerPresetRepository.create({
					name: 'Default Settings',
					workDuration: settings.workDuration,
					breakDuration: settings.breakDuration,
					repetitions: settings.repetitions,
					user: userId,
					createdAt: new Date(),
					updatedAt: new Date()
				})

				console.log(`[TimerPresetService] Created new Default Settings preset:`, {
					presetId: newPreset._id,
					settings: {
						workDuration: newPreset.workDuration,
						breakDuration: newPreset.breakDuration,
						repetitions: newPreset.repetitions
					}
				})
			}
		} catch (error) {
			console.error(`[TimerPresetService] Error syncing Default Settings for user ${userId}:`, error)
			throw error
		}
	}
}
