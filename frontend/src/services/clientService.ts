import api from './api';
import { Client } from '../types';

export const clientService = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    const response = await api.get('/api/clients');
    return response.data.data;
  },

  // Get a single client by ID
  getClient: async (id: string): Promise<Client> => {
    const response = await api.get(`/api/clients/${id}`);
    return response.data.data;
  },

  // Create a new client
  createClient: async (
    client: Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<Client> => {
    const response = await api.post('/api/clients', client);
    return response.data.data;
  },

  // Update a client
  updateClient: async (
    id: string,
    client: Partial<Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<Client> => {
    const response = await api.put(`/api/clients/${id}`, client);
    return response.data.data;
  },

  // Delete a client
  deleteClient: async (id: string): Promise<void> => {
    await api.delete(`/api/clients/${id}`);
  },
};
