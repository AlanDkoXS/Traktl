import { ClientRepository } from '../../../domain/repositories/clientRepository.interface'
import {
    Client as ClientEntity,
    ClientEntity as ClientDomain,
} from '../../../domain/entities/client.entity'
import { Client } from '../../../data/mongodb/models/client.model'

export class MongoClientRepository implements ClientRepository {
    async create(client: ClientDomain): Promise<ClientEntity> {
        const newClient = await Client.create(client)
        return this.mapToDomain(newClient)
    }

    async findById(id: string): Promise<ClientEntity | null> {
        const client = await Client.findById(id)
        return client ? this.mapToDomain(client) : null
    }

    async update(
        id: string,
        clientData: Partial<ClientDomain>
    ): Promise<ClientEntity | null> {
        const updatedClient = await Client.findByIdAndUpdate(
            id,
            { ...clientData, updatedAt: new Date() },
            { new: true }
        )
        return updatedClient ? this.mapToDomain(updatedClient) : null
    }

    async delete(id: string): Promise<boolean> {
        const result = await Client.findByIdAndDelete(id)
        return !!result
    }

    async listByUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<ClientEntity[]> {
        const skip = (page - 1) * limit
        const clients = await Client.find({ user: userId })
            .skip(skip)
            .limit(limit)
        return clients.map((client) => this.mapToDomain(client))
    }

    async findByCriteria(
        criteria: Partial<ClientDomain>
    ): Promise<ClientEntity[]> {
        const clients = await Client.find(criteria)
        return clients.map((client) => this.mapToDomain(client))
    }

    async countByUser(userId: string): Promise<number> {
        return await Client.countDocuments({ user: userId })
    }

    private mapToDomain(client: any): ClientEntity {
        return {
            _id: client._id.toString(),
            name: client.name,
            contactInfo: client.contactInfo,
            color: client.color,
            user: client.user.toString(),
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        }
    }
}
