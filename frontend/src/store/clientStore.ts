import { create } from 'zustand'
import { clientService } from '../services/clientService'
import { Client } from '../types'

interface ApiError extends Error {
	response?: {
		data?: {
			message?: string
		}
	}
}

interface ClientState {
	clients: Client[]
	selectedClient: Client | null
	isLoading: boolean
	error: string | null
	fetchClients: () => Promise<Client[]>
	fetchClient: (id: string) => Promise<Client | null>
	createClient: (
		client: Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
	) => Promise<Client>
	updateClient: (
		id: string,
		client: Partial<
			Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	) => Promise<Client>
	deleteClient: (id: string) => Promise<void>
	selectClient: (client: Client | null) => void
	clearSelectedClient: () => void
}

export const useClientStore = create<ClientState>((set) => ({
	clients: [],
	selectedClient: null,
	isLoading: false,
	error: null,
	fetchClients: async () => {
		try {
			set({ isLoading: true, error: null })
			const clients = await clientService.getClients()
			set({ clients, isLoading: false })
			return clients
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Error fetching clients:', error)
			set({
				error: apiError.message || 'Failed to fetch clients',
				isLoading: false,
			})
			return []
		}
	},
	fetchClient: async (id: string) => {
		if (!id || id === 'undefined') {
			console.error('Invalid client ID provided:', id)
			set({
				error: 'Invalid client ID',
				isLoading: false,
				selectedClient: null,
			})
			return null
		}
		try {
			set({ isLoading: true, error: null })
			console.log(`Fetching client with ID: ${id}`)
			const client = await clientService.getClient(id)
			if (!client) {
				console.error('Client not found for ID:', id)
				throw new Error('Client not found')
			}
			console.log('Client fetched successfully:', client)
			set({ selectedClient: client, isLoading: false })
			return client
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error(`Error fetching client with ID ${id}:`, error)
			set({
				error: apiError.message || 'Failed to fetch client',
				isLoading: false,
				selectedClient: null,
			})
			return null
		}
	},
	createClient: async (client) => {
		try {
			set({ isLoading: true, error: null })
			const newClient = await clientService.createClient(client)
			set((state) => ({
				clients: [...state.clients, newClient],
				isLoading: false,
			}))
			return newClient
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Error creating client:', error)
			set({
				error: apiError.message || 'Failed to create client',
				isLoading: false,
			})
			throw error
		}
	},
	updateClient: async (id, client) => {
		try {
			set({ isLoading: true, error: null })
			const updatedClient = await clientService.updateClient(id, client)
			set((state) => ({
				clients: state.clients.map((c) =>
					c.id === id ? updatedClient : c,
				),
				selectedClient:
					state.selectedClient?.id === id
						? updatedClient
						: state.selectedClient,
				isLoading: false,
			}))
			return updatedClient
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Error updating client:', error)
			set({
				error: apiError.message || 'Failed to update client',
				isLoading: false,
			})
			throw error
		}
	},
	deleteClient: async (id) => {
		try {
			set({ isLoading: true, error: null })
			await clientService.deleteClient(id)
			set((state) => ({
				clients: state.clients.filter((c) => c.id !== id),
				selectedClient:
					state.selectedClient?.id === id
						? null
						: state.selectedClient,
				isLoading: false,
			}))
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Error deleting client:', error)
			set({
				error: apiError.message || 'Failed to delete client',
				isLoading: false,
			})
			throw error
		}
	},
	selectClient: (client) => {
		set({ selectedClient: client })
	},
	clearSelectedClient: () => {
		set({ selectedClient: null })
	},
}))
