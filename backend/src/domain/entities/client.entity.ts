export interface Client {
	_id: string
	name: string
	contactInfo: string
	color: string
	createdAt: Date
	updatedAt: Date
	user: string
}

export interface ClientEntity extends Omit<Client, '_id'> {
	id?: string
}
