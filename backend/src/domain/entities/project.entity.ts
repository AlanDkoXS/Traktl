export interface Project {
	_id: string
	name: string
	description: string
	color: string
	client?: string
	createdAt: Date
	updatedAt: Date
	status: 'active' | 'archived'
	user: string
}

export interface ProjectEntity extends Omit<Project, '_id'> {
	id?: string
}
