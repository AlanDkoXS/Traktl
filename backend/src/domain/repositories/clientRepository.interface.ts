import { Client, ClientEntity } from '../entities/client.entity'

export interface ClientRepository {
	create(client: ClientEntity): Promise<Client>

	findById(id: string): Promise<Client | null>

	update(id: string, client: Partial<ClientEntity>): Promise<Client | null>

	delete(id: string): Promise<boolean>

	listByUser(userId: string, page?: number, limit?: number): Promise<Client[]>

	findByCriteria(criteria: Partial<ClientEntity>): Promise<Client[]>

	countByUser(userId: string): Promise<number>
}
