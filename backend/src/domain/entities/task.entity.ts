export interface Task {
	_id: string
	name: string
	description: string
	project: string | Object
	status: 'pending' | 'in-progress' | 'completed'
	createdAt: Date
	updatedAt: Date
	user: string
}

export interface TaskEntity extends Omit<Task, '_id'> {
	id?: string
}
