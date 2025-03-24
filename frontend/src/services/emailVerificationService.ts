import api from './api'
import { useAuthStore } from '../store/authStore'

export const emailVerificationService = {
	checkVerificationStatus: async (): Promise<{ isVerified: boolean }> => {
		try {
			const response = await api.get('/users/verification-status')
			const isVerified = !!response.data.data?.isVerified
			useAuthStore.getState().setVerificationStatus(isVerified)
			return { isVerified }
		} catch (error) {
			console.error('Error checking verification status:', error)
			return { isVerified: useAuthStore.getState().isEmailVerified }
		}
	},

	requestVerification: async (): Promise<{
		success: boolean
		message: string
	}> => {
		try {
			const response = await api.post('/users/request-verification')
			console.log('Request verification response:', response.data)
			useAuthStore.getState().setVerificationStatus(false)
			return response.data
		} catch (error) {
			console.error('Error requesting verification:', error)
			throw error
		}
	},

	verifyEmail: async (
		token: string,
	): Promise<{ success: boolean; message: string }> => {
		try {
			const response = await api.post('/users/verify-email', { token })
			console.log('Verify email response:', response.data)
			useAuthStore.getState().setVerificationStatus(true)
			return response.data
		} catch (error) {
			console.error('Error verifying email:', error)
			throw error
		}
	},
}
