import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, preferredLanguage: string, theme: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem('auth-token'),
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const { token, user } = await authService.login(email, password);
          
          // Save token to localStorage
          localStorage.setItem('auth-token', token);
          
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null
          });
          throw new Error(errorMessage);
        }
      },
      
      register: async (name, email, password, preferredLanguage, theme) => {
        try {
          set({ isLoading: true, error: null });
          
          const { token, user } = await authService.register(
            name, 
            email, 
            password, 
            preferredLanguage, 
            theme
          );
          
          // Save token to localStorage
          localStorage.setItem('auth-token', token);
          
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null
          });
          throw new Error(errorMessage);
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth-token');
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },
      
      loadUser: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        
        try {
          set({ isLoading: true });
          
          const user = await authService.getProfile();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (err: any) {
          console.error('Error loading user:', err);
          localStorage.removeItem('auth-token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.response?.data?.message || 'Failed to load user'
          });
        }
      },
      
      updateUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedUser = await authService.updateProfile(userData);
          
          set(state => ({
            user: updatedUser,
            isLoading: false,
          }));
          
        } catch (err: any) {
          set({
            error: err.response?.data?.message || 'Failed to update user',
            isLoading: false,
          });
          throw new Error(err.response?.data?.message || 'Failed to update user');
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
