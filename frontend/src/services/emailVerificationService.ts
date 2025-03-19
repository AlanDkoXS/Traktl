import api from './api';
import { useAuthStore } from '../store/authStore';

export const emailVerificationService = {
  checkVerificationStatus: async () => {
    try {
      const response = await api.get('/users/verification-status');
      const isVerified = response.data.isVerified;
      const isPending = response.data.hasPendingVerification || false;

      // Update the auth store
      useAuthStore.getState().setVerificationStatus(isVerified, isPending);

      return {
        isVerified,
        isPending
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  },

  requestVerification: async () => {
    try {
      const response = await api.post('/users/request-verification');

      // Update the auth store to show pending verification
      useAuthStore.getState().setVerificationStatus(false, true);

      return response.data;
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.post('/users/verify-email', { token });

      // If successful, update the auth store to show verified status
      useAuthStore.getState().setVerificationStatus(true, false);

      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
};
