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
  loginWithGoogle: (tokenId: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    preferredLanguage: string,
    theme: string
  ) => Promise<void>;
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

          console.log('Login successful, token received:', token);

          // Save token to localStorage (store exactly as received from server)
          if (token) {
            localStorage.setItem('auth-token', token);

            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('No token received from server');
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Login failed';
          console.error('Login error:', errorMessage);

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
          });
          throw new Error(errorMessage);
        }
      },

      loginWithGoogle: async (tokenId) => {
        try {
          set({ isLoading: true, error: null });

          const { token, user } = await authService.loginWithGoogle(tokenId);

          console.log('Google login successful, token received:', token);

          // Save token to localStorage
          if (token) {
            localStorage.setItem('auth-token', token);

            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('No token received from server');
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Google login failed';
          console.error('Google login error:', errorMessage);

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
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

          console.log('Register successful, token received:', token);

          // Save token to localStorage
          if (token) {
            localStorage.setItem('auth-token', token);

            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('No token received from server');
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Registration failed';
          console.error('Registration error:', errorMessage);

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        console.log('Logging out, removing token');
        localStorage.removeItem('auth-token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      loadUser: async () => {
        const token = localStorage.getItem('auth-token');
        console.log('loadUser called, token from localStorage:', token);

        if (!token) {
          console.log('No token found, setting isAuthenticated to false');
          set({ isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true, token });

          const user = await authService.getProfile();
          console.log('User profile loaded:', user);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          console.error('Error loading user:', err);
          localStorage.removeItem('auth-token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.response?.data?.message || 'Failed to load user',
          });
        }
      },

      updateUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          const updatedUser = await authService.updateProfile(userData);

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || 'Failed to update user',
            isLoading: false,
          });
          throw new Error(err.response?.data?.message || 'Failed to update user');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        // Don't persist isAuthenticated, as it should be verified on load
        isAuthenticated: false,
      }),
    }
  )
);
