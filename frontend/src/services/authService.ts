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
      console.log('Sending login request with:', { email, password: '******' });
      const response = await api.post('/users/login', { email, password });

      console.log('Login API response:', response.data);

      // Check how the response is structured and extract token and user accordingly
      let token, user;

      if (response.data.token) {
        // Format 1: { token, user }
        token = response.data.token;
        user = response.data.data || response.data.user;
      } else if (response.data.data?.token) {
        // Format 2: { data: { token, user } }
        token = response.data.data.token;
        user = response.data.data.user || response.data.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      return { token, user };
    } catch (error) {
      console.error('Login error in service:', error);
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
      // Make sure we only send 'light' or 'dark', not 'system'
      const safeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';
      
      const response = await api.post('/users/register', {
        name,
        email,
        password,
        preferredLanguage,
        theme: safeTheme,
      });

      console.log('Register API response:', response.data);

      // Handle different response formats
      let token, user;

      if (response.data.token) {
        token = response.data.token;
        user = response.data.user || response.data.data;
      } else if (response.data.data?.token) {
        token = response.data.data.token;
        user = response.data.data.user || response.data.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      return { token, user };
    } catch (error) {
      console.error('Register error in service:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile');
      console.log('Profile API response:', response.data);

      // Handle different response formats
      let user;

      if (response.data.user) {
        user = response.data.user;
      } else if (response.data.data) {
        user = response.data.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      return user;
    } catch (error) {
      console.error('Get profile error in service:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      // Make sure we only send 'light' or 'dark', not 'system'
      const safeUserData = {...userData};
      if (safeUserData.theme && safeUserData.theme !== 'light' && safeUserData.theme !== 'dark') {
        safeUserData.theme = 'light';
      }
      
      const response = await api.put('/users/profile', safeUserData);

      // Handle different response formats
      let user;

      if (response.data.user) {
        user = response.data.user;
      } else if (response.data.data) {
        user = response.data.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      return user;
    } catch (error) {
      console.error('Update profile error in service:', error);
      throw error;
    }
  },
};
