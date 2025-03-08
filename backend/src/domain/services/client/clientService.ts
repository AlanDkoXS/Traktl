import { ClientRepository } from '../../repositories/clientRepository.interface'
import { Client, ClientEntity } from '../../entities/client.entity'
import { CreateClientDTO } from '../../dtos/client/create-client.dto'
import { UpdateClientDTO } from '../../dtos/client/update-client.dto'
import { CustomError } from '../../errors/custom.errors'

export class ClientService {
    constructor(private readonly clientRepository: ClientRepository) {}

    async createClient(
        userId: string,
        createClientDto: CreateClientDTO
    ): Promise<Client> {
        const clientEntity: ClientEntity = {
            name: createClientDto.name,
            contactInfo: createClientDto.contactInfo || '',
            color: createClientDto.color || '#e74c3c',
            user: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        return await this.clientRepository.create(clientEntity)
    }

    async updateClient(
        userId: string,
        clientId: string,
        updateClientDto: UpdateClientDTO
    ): Promise<Client> {
        const existingClient = await this.clientRepository.findById(clientId)
        if (!existingClient || existingClient.user.toString() !== userId) {
            throw CustomError.notFound('Client not found')
        }

        const updatedClient = await this.clientRepository.update(
            clientId,
            updateClientDto
        )
        if (!updatedClient) {
            throw CustomError.internalServer('Error updating client')
        }

        return updatedClient
    }

    async getClientById(userId: string, clientId: string): Promise<Client> {
        const client = await this.clientRepository.findById(clientId)

        if (!client || client.user.toString() !== userId) {
            throw CustomError.notFound('Client not found')
        }

        return client
    }

    async listClients(
        userId: string,
        page?: number,
        limit?: number
    ): Promise<Client[]> {
        return await this.clientRepository.listByUser(userId, page, limit)
    }

    async deleteClient(userId: string, clientId: string): Promise<boolean> {
        const existingClient = await this.clientRepository.findById(clientId)
        if (!existingClient || existingClient.user.toString() !== userId) {
            throw CustomError.notFound('Client not found')
        }

        const deleted = await this.clientRepository.delete(clientId)
        if (!deleted) {
            throw CustomError.internalServer('Error deleting client')
        }

        return true
    }

    async countUserClients(userId: string): Promise<number> {
        return await this.clientRepository.countByUser(userId)
    }
}
