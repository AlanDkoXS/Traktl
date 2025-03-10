import api from './api';
import { TimerPreset } from '../types';

export const timerPresetService = {
  // Get all timer presets
  getTimerPresets: async (): Promise<TimerPreset[]> => {
    const response = await api.get('/api/timer-presets');
    return response.data.data;
  },

  // Get a single timer preset by ID
  getTimerPreset: async (id: string): Promise<TimerPreset> => {
    const response = await api.get(`/api/timer-presets/${id}`);
    return response.data.data;
  },

  // Create a new timer preset
  createTimerPreset: async (
    timerPreset: Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>
  ): Promise<TimerPreset> => {
    const response = await api.post('/api/timer-presets', timerPreset);
    return response.data.data;
  },

  // Update a timer preset
  updateTimerPreset: async (
    id: string,
    timerPreset: Partial<Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
  ): Promise<TimerPreset> => {
    const response = await api.put(`/api/timer-presets/${id}`, timerPreset);
    return response.data.data;
  },

  // Delete a timer preset
  deleteTimerPreset: async (id: string): Promise<void> => {
    await api.delete(`/api/timer-presets/${id}`);
  },
};
