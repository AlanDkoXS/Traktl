import { create } from 'zustand';
import { clientService } from '../services';
import { Client } from '../types';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
  
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Omit<Client, 'id' | 'user' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  selectClient: (client: Client | null) => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  
  fetchClients: async () => {
    try {
      set({ isLoading: true, error: null });
      const clients = await clientService.getClients();
      set({ clients, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch clients', 
        isLoading: false 
      });
    }
  },
  
  fetchClient: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const client = await clientService.getClient(id);
      set({ selectedClient: client, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch client', 
        isLoading: false 
      });
    }
  },
  
  createClient: async (client) => {
    try {
      set({ isLoading: true, error: null });
      const newClient = await clientService.createClient(client);
      set(state => ({ 
        clients: [...state.clients, newClient], 
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create client', 
        isLoading: false 
      });
    }
  },
  
  updateClient: async (id, client) => {
    try {
      set({ isLoading: true, error: null });
      const updatedClient = await clientService.updateClient(id, client);
      set(state => ({ 
        clients: state.clients.map(c => c.id === id ? updatedClient : c),
        selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update client', 
        isLoading: false 
      });
    }
  },
  
  deleteClient: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.deleteClient(id);
      set(state => ({ 
        clients: state.clients.filter(c => c.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete client', 
        isLoading: false 
      });
    }
  },
  
  selectClient: (client) => {
    set({ selectedClient: client });
  }
}));
