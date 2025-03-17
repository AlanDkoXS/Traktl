import api from './api';

export const emailVerificationService = {
  checkVerificationStatus: async () => {
    try {
      const response = await api.get('/users/verification-status');
      return {
        isVerified: response.data.isVerified,
        isPending: response.data.hasPendingVerification || false
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  },

  requestVerification: async () => {
    try {
      const response = await api.post('/users/request-verification');
      return response.data;
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.post('/users/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
};
