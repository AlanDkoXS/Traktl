import { create } from 'zustand';
import { timerPresetService } from '../services/timerPresetService';
import { TimerPreset } from '../types';

interface TimerPresetState {
  timerPresets: TimerPreset[];
  selectedTimerPreset: TimerPreset | null;
  isLoading: boolean;
  error: string | null;

  fetchTimerPresets: () => Promise<TimerPreset[]>;
  fetchTimerPreset: (id: string) => Promise<TimerPreset | null>;
  createTimerPreset: (timerPreset: Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<TimerPreset>;
  updateTimerPreset: (id: string, timerPreset: Partial<Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>>) => Promise<TimerPreset>;
  deleteTimerPreset: (id: string) => Promise<void>;
  selectTimerPreset: (timerPreset: TimerPreset | null) => void;
  clearSelectedTimerPreset: () => void;
}

export const useTimerPresetStore = create<TimerPresetState>((set, get) => ({
  timerPresets: [],
  selectedTimerPreset: null,
  isLoading: false,
  error: null,

  fetchTimerPresets: async () => {
    try {
      set({ isLoading: true, error: null });
      const timerPresets = await timerPresetService.getTimerPresets();
      set({ timerPresets, isLoading: false });
      return timerPresets;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch timer presets',
        isLoading: false,
      });
      return [];
    }
  },

  fetchTimerPreset: async (id: string) => {
    if (!id || id === 'undefined') {
      set({ error: 'Invalid timer preset ID', isLoading: false, selectedTimerPreset: null });
      return null;
    }
    
    try {
      set({ isLoading: true, error: null });
      const timerPreset = await timerPresetService.getTimerPreset(id);
      
      if (!timerPreset) throw new Error('Timer preset not found');
      
      set({ selectedTimerPreset: timerPreset, isLoading: false });
      return timerPreset;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch timer preset',
        isLoading: false,
        selectedTimerPreset: null
      });
      return null;
    }
  },

  createTimerPreset: async (timerPreset) => {
    try {
      set({ isLoading: true, error: null });
      const newTimerPreset = await timerPresetService.createTimerPreset(timerPreset);
      set((state) => ({
        timerPresets: [...state.timerPresets, newTimerPreset],
        isLoading: false,
      }));
      return newTimerPreset;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create timer preset',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTimerPreset: async (id, timerPreset) => {
    try {
      set({ isLoading: true, error: null });
      const updatedTimerPreset = await timerPresetService.updateTimerPreset(id, timerPreset);
      set((state) => ({
        timerPresets: state.timerPresets.map((tp) => (tp.id === id ? updatedTimerPreset : tp)),
        selectedTimerPreset: state.selectedTimerPreset?.id === id ? updatedTimerPreset : state.selectedTimerPreset,
        isLoading: false,
      }));
      return updatedTimerPreset;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update timer preset',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTimerPreset: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await timerPresetService.deleteTimerPreset(id);
      set((state) => ({
        timerPresets: state.timerPresets.filter((tp) => tp.id !== id),
        selectedTimerPreset: state.selectedTimerPreset?.id === id ? null : state.selectedTimerPreset,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete timer preset',
        isLoading: false,
      });
      throw error;
    }
  },

  selectTimerPreset: (timerPreset) => set({ selectedTimerPreset: timerPreset }),
  clearSelectedTimerPreset: () => set({ selectedTimerPreset: null })
}));
