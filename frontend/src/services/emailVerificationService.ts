import api from './api';

export const emailVerificationService = {
	// Track last request time to prevent spam
	lastRequestTime: 0,
	
	// Request email verification
	requestVerification: async (): Promise<void> => {
		const now = Date.now();
		const elapsedSeconds = (now - emailVerificationService.lastRequestTime) / 1000;
		
		// Enforce 60 seconds cooldown
		if (elapsedSeconds < 60) {
			const remainingSeconds = Math.ceil(60 - elapsedSeconds);
			throw new Error(`Por favor espera ${remainingSeconds} segundos antes de solicitar otro correo`);
		}
		
		try {
			await api.post('users/request-verification');
			emailVerificationService.lastRequestTime = now;
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
