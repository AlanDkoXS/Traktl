import api from './api';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/api/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  register: async (
    name: string,
    email: string,
    password: string,
    preferredLanguage: string = 'en',
    theme: string = 'light'
  ): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/api/users/register', {
        name,
        email,
        password,
        preferredLanguage,
        theme,
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put('/api/users/profile', userData);
      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
