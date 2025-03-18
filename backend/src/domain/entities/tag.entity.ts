export interface Tag {
	_id: string
	name: string
	color: string
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface TagEntity extends Omit<Tag, '_id'> {
	id?: string
}
