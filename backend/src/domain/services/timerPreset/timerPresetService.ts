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
		// Buscar el preset por defecto del usuario
		const defaultPreset = await this.timerPresetRepository.findByCriteria({
			user: userId,
			name: 'Default Settings'
		})

		if (defaultPreset.length > 0) {
			// Actualizar el preset existente
			await this.timerPresetRepository.update(defaultPreset[0]._id, {
				workDuration: settings.workDuration,
				breakDuration: settings.breakDuration,
				repetitions: settings.repetitions,
				updatedAt: new Date()
			})
		} else {
			// Crear un nuevo preset por defecto
			await this.timerPresetRepository.create({
				name: 'Default Settings',
				workDuration: settings.workDuration,
				breakDuration: settings.breakDuration,
				repetitions: settings.repetitions,
				user: userId,
				createdAt: new Date(),
				updatedAt: new Date()
			})
		}
	}
}
