export interface TimeEntry {
	_id: string
	user: string
	project: string
	task?: string
	tags: string[]
	startTime: Date
	endTime?: Date
	duration: number // in milliseconds
	notes: string
	createdAt: Date
	updatedAt: Date
	isRunning: boolean
}

export interface TimeEntryEntity extends Omit<TimeEntry, '_id'> {
	id?: string
}
