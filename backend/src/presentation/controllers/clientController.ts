import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { ClientService } from '../../domain/services/client/clientService'
import { CreateClientDTO, UpdateClientDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class ClientController extends BaseController {
	constructor(private readonly clientService: ClientService) {
		super()
	}

	public createClient = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const [error, createClientDto] = CreateClientDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			const client = await this.clientService.createClient(
				userId,
				createClientDto!,
			)
			return this.handleSuccess(res, client, 201)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getClientById = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			const client = await this.clientService.getClientById(userId, id)
			return this.handleSuccess(res, client)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public updateClient = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			const [error, updateClientDto] = UpdateClientDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			const updatedClient = await this.clientService.updateClient(
				userId,
				id,
				updateClientDto!,
			)
			return this.handleSuccess(res, updatedClient)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public deleteClient = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			await this.clientService.deleteClient(userId, id)
			return this.handleSuccess(res, {
				message: 'Client deleted successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public listClients = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const page = req.query.page
				? parseInt(req.query.page as string)
				: undefined
			const limit = req.query.limit
				? parseInt(req.query.limit as string)
				: undefined

			const clients = await this.clientService.listClients(
				userId,
				page,
				limit,
			)
			return this.handleSuccess(res, clients)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}
