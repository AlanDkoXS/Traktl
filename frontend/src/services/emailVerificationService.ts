import api from './api';

export const emailVerificationService = {
	// Request email verification
	requestVerification: async (): Promise<void> => {
		try {
			await api.post('users/request-verification');
		} catch (error) {
			console.error('Error requesting email verification:', error);
			throw error;
		}
	},

	// Verify email with token
	verifyEmail: async (token: string): Promise<void> => {
		try {
			await api.post('users/verify-email', { token });
		} catch (error) {
			console.error('Error verifying email:', error);
			throw error;
		}
	},

	// Check email verification status
	checkVerificationStatus: async (): Promise<boolean> => {
		try {
			const response = await api.get('users/verification-status');
			return response.data.isVerified || false;
		} catch (error) {
			console.error('Error checking verification status:', error);
			return false;
		}
	},
};
