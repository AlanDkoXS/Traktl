import { TimerPreset, TimerPresetEntity } from '../entities/timer-preset.entity'

export interface TimerPresetRepository {
	create(timerPreset: TimerPresetEntity): Promise<TimerPreset>

	findById(id: string): Promise<TimerPreset | null>

	update(
		id: string,
		timerPreset: Partial<TimerPresetEntity>,
	): Promise<TimerPreset | null>

	delete(id: string): Promise<boolean>

	listByUser(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<TimerPreset[]>

	findByCriteria(criteria: Partial<TimerPresetEntity>): Promise<TimerPreset[]>

	countByUser(userId: string): Promise<number>
}
