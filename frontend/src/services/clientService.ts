import api from './api';
import { Client } from '../types';

// Helper to transform MongoDB _id to id in our frontend
const formatClient = (client: any): Client => {
  if (!client) return client;
  
  return {
    id: client._id || client.id,
    name: client.name,
    contactInfo: client.contactInfo || '',
    color: client.color || '#3b82f6',
    user: client.user?._id || client.user || '',
    createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
    updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date()
  };
};

export const clientService = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    try {
      console.log('Fetching clients...');
      const response = await api.get('/clients');
      console.log('Clients response:', response.data);

      // Handle different response formats
      let clients = [];
      if (Array.isArray(response.data)) {
        clients = response.data;
      } else if (Array.isArray(response.data.data)) {
        clients = response.data.data;
      } else {
        console.error('Unexpected clients response format:', response.data);
        return [];
      }

      // Format each client to handle _id to id conversion
      return clients.map(formatClient);
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Get a single client by ID
  getClient: async (id: string): Promise<Client> => {
    try {
      console.log(`Fetching client with id: ${id}`);
      const response = await api.get(`/clients/${id}`);
      console.log('Client response:', response.data);

      // Handle different response formats
      let client;
      if (response.data.data) {
        client = response.data.data;
      } else {
        client = response.data;
      }

      return formatClient(client);
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  // Create a new client
  createClient: async (
    client: Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<Client> => {
    try {
      console.log('Creating client with data:', client);
      const response = await api.post('/clients', client);

      // Handle different response formats
      let newClient;
      if (response.data.data) {
        newClient = response.data.data;
      } else {
        newClient = response.data;
      }

      return formatClient(newClient);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update a client
  updateClient: async (
    id: string,
    client: Partial<Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<Client> => {
    try {
      console.log(`Updating client ${id} with data:`, client);
      const response = await api.put(`/clients/${id}`, client);

      // Handle different response formats
      let updatedClient;
      if (response.data.data) {
        updatedClient = response.data.data;
      } else {
        updatedClient = response.data;
      }

      return formatClient(updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting client with id: ${id}`);
      await api.delete(`/clients/${id}`);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },
};
