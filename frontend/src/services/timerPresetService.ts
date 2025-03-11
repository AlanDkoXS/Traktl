import api from './api';
import { TimerPreset } from '../types';

// Helper to transform MongoDB _id to id in our frontend
const formatTimerPreset = (preset: any): TimerPreset => {
  if (!preset) return preset;
  
  return {
    id: preset._id || preset.id,
    name: preset.name,
    workDuration: preset.workDuration,
    breakDuration: preset.breakDuration,
    repetitions: preset.repetitions || 1,
    user: typeof preset.user === 'object' && preset.user?._id 
      ? preset.user._id 
      : preset.user || '',
    createdAt: preset.createdAt ? new Date(preset.createdAt) : new Date(),
    updatedAt: preset.updatedAt ? new Date(preset.updatedAt) : new Date()
  };
};

export const timerPresetService = {
  // Get all timer presets
  getTimerPresets: async (): Promise<TimerPreset[]> => {
    try {
      console.log('Fetching timer presets...');
      const response = await api.get('/timer-presets');
      console.log('Timer presets response:', response.data);
      
      // Handle different response formats
      let presets = [];
      if (Array.isArray(response.data)) {
        presets = response.data;
      } else if (Array.isArray(response.data.data)) {
        presets = response.data.data;
      } else {
        console.error('Unexpected timer presets response format:', response.data);
        return [];
      }
      
      return presets.map(formatTimerPreset);
    } catch (error) {
      console.error('Error fetching timer presets:', error);
      throw error;
    }
  },

  // Get a single timer preset by ID
  getTimerPreset: async (id: string): Promise<TimerPreset> => {
    try {
      console.log(`Fetching timer preset with id: ${id}`);
      const response = await api.get(`/timer-presets/${id}`);
      console.log('Timer preset response:', response.data);
      
      // Handle different response formats
      let preset;
      if (response.data.data) {
        preset = response.data.data;
      } else {
        preset = response.data;
      }
      
      return formatTimerPreset(preset);
    } catch (error) {
      console.error('Error fetching timer preset:', error);
      throw error;
    }
  },

  // Create a new timer preset
  createTimerPreset: async (
    timerPreset: Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<TimerPreset> => {
    try {
      console.log('Creating timer preset with data:', timerPreset);
      const response = await api.post('/timer-presets', timerPreset);
      
      // Handle different response formats
      let newPreset;
      if (response.data.data) {
        newPreset = response.data.data;
      } else {
        newPreset = response.data;
      }
      
      return formatTimerPreset(newPreset);
    } catch (error) {
      console.error('Error creating timer preset:', error);
      throw error;
    }
  },

  // Update a timer preset
  updateTimerPreset: async (
    id: string,
    timerPreset: Partial<Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<TimerPreset> => {
    try {
      console.log(`Updating timer preset ${id} with data:`, timerPreset);
      const response = await api.put(`/timer-presets/${id}`, timerPreset);
      
      // Handle different response formats
      let updatedPreset;
      if (response.data.data) {
        updatedPreset = response.data.data;
      } else {
        updatedPreset = response.data;
      }
      
      return formatTimerPreset(updatedPreset);
    } catch (error) {
      console.error('Error updating timer preset:', error);
      throw error;
    }
  },

  // Delete a timer preset
  deleteTimerPreset: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting timer preset with id: ${id}`);
      await api.delete(`/timer-presets/${id}`);
    } catch (error) {
      console.error('Error deleting timer preset:', error);
      throw error;
    }
  },
};
