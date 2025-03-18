import api from './api'
import { useAuthStore } from '../store/authStore'

export const emailVerificationService = {
	checkVerificationStatus: async () => {
		console.log(
			'⚪ emailVerificationService: Checking verification status...',
		)
		try {
			const response = await api.get('/users/verification-status')
			console.log(
				'🟢 emailVerificationService: Verification response:',
				response.data,
			)

			const isVerified = response.data.isVerified
			const isPending = response.data.hasPendingVerification || false

			console.log('🔵 emailVerificationService: Status extracted:', {
				isVerified,
				isPending,
			})

			// Update the auth store with the current verification status
			const authStore = useAuthStore.getState()
			console.log(
				'🔵 emailVerificationService: Current auth store state:',
				{
					isEmailVerified: authStore.isEmailVerified,
					isPendingVerification: authStore.isPendingVerification,
				},
			)

			authStore.setVerificationStatus(isVerified, isPending)

			console.log(
				'🟢 emailVerificationService: Auth store updated with verification status',
			)

			return {
				isVerified,
				isPending,
			}
		} catch (error) {
			console.error(
				'🔴 emailVerificationService: Error checking verification status:',
				error,
			)
			throw error
		}
	},

	requestVerification: async () => {
		console.log('⚪ emailVerificationService: Requesting verification...')
		try {
			const response = await api.post('/users/request-verification')
			console.log(
				'🟢 emailVerificationService: Verification requested, response:',
				response.data,
			)

			// Update the auth store to show pending verification
			const authStore = useAuthStore.getState()
			console.log(
				'🔵 emailVerificationService: Setting pending verification in auth store',
			)
			authStore.setVerificationStatus(false, true)

			console.log(
				'🟢 emailVerificationService: Auth store updated to pending verification',
			)
			return response.data
		} catch (error) {
			console.error(
				'🔴 emailVerificationService: Error requesting verification:',
				error,
			)
			throw error
		}
	},

	verifyEmail: async (token: string) => {
		console.log(
			'⚪ emailVerificationService: Verifying email with token...',
		)
		try {
			const response = await api.post('/users/verify-email', { token })
			console.log(
				'🟢 emailVerificationService: Email verified, response:',
				response.data,
			)

			// If successful, update the auth store to show verified status
			const authStore = useAuthStore.getState()
			console.log(
				'🔵 emailVerificationService: Setting verified status in auth store',
			)
			authStore.setVerificationStatus(true, false)

			console.log(
				'🟢 emailVerificationService: Auth store updated to verified',
			)
			return response.data
		} catch (error) {
			console.error(
				'🔴 emailVerificationService: Error verifying email:',
				error,
			)
			throw error
		}
	},
}
