export interface TimerPreset {
	_id: string
	name: string
	workDuration: number
	breakDuration: number
	repetitions: number
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface TimerPresetEntity extends Omit<TimerPreset, '_id'> {
	id?: string
}
