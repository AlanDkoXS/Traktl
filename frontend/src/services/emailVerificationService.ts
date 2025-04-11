import api from './api'
import { useAuthStore } from '../store/authStore'

interface EmailVerificationToken {
	token: string
	expiresAt: Date
}

export const emailVerificationService = {
	checkVerificationStatus: async (): Promise<{
		isVerified: boolean
		emailVerificationToken?: EmailVerificationToken
	}> => {
		try {
			const response = await api.get('/users/verification-status')
			console.log('Verification status response:', response.data)

			const isVerified = !!response.data.data?.isVerified
			const emailVerificationToken =
				response.data.data?.emailVerificationToken

			console.log('Setting verification status from server:', {
				responseData: response.data,
				isVerified,
				emailVerificationToken,
			})

			useAuthStore
				.getState()
				.setVerificationStatus(isVerified, emailVerificationToken)
			return { isVerified, emailVerificationToken }
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
			const currentLanguage = localStorage.getItem('i18nextLng') || 'en'

			const response = await api.post('/users/request-verification', {
				language: currentLanguage,
			})
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

			await useAuthStore.getState().checkVerificationStatus()

			return response.data
		} catch (error) {
			console.error('Error verifying email:', error)
			throw error
		}
	},
}
