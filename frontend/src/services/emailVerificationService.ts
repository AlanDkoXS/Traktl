import api from './api'
import { useAuthStore } from '../store/authStore'

// Define interface for verification status response
interface VerificationStatus {
	isVerified: boolean
	isPending: boolean
}

export const emailVerificationService = {
	/**
	 * Checks the verification status of the current user's email
	 * @returns Object with verification status and pending verification status
	 */
	checkVerificationStatus: async (): Promise<VerificationStatus> => {
		try {
			const response = await api.get('/users/verification-status')
			console.log('Verification status API response:', response.data)

			// Correctly access the nested data structure
			const isVerified = response.data.data?.isVerified === true
			const isPending =
				response.data.data?.hasPendingVerification === true

			console.log('Extracted verification status:', {
				isVerified,
				isPending,
			})

			// Update the auth store
			useAuthStore.getState().setVerificationStatus(isVerified, isPending)

			return {
				isVerified,
				isPending,
			}
		} catch (error) {
			console.error('Error checking verification status:', error)
			// Return existing state on error
			const state = useAuthStore.getState()
			return {
				isVerified: state.isEmailVerified,
				isPending: state.isPendingVerification,
			}
		}
	},

	/**
	 * Requests a new verification email for the current user
	 */
	requestVerification: async (): Promise<{
		success: boolean
		message: string
	}> => {
		try {
			const response = await api.post('/users/request-verification')
			console.log('Request verification response:', response.data)

			// Update the auth store to show pending verification
			useAuthStore.getState().setVerificationStatus(false, true)

			return response.data
		} catch (error) {
			console.error('Error requesting verification:', error)
			throw error
		}
	},

	/**
	 * Verifies the email with the provided token
	 * @param token Verification token
	 */
	verifyEmail: async (
		token: string,
	): Promise<{ success: boolean; message: string }> => {
		try {
			const response = await api.post('/users/verify-email', { token })
			console.log('Verify email response:', response.data)

			// If successful, update the auth store
			useAuthStore.getState().setVerificationStatus(true, false)

			return response.data
		} catch (error) {
			console.error('Error verifying email:', error)
			throw error
		}
	},
}
