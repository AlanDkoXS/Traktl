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

			const user = useAuthStore.getState().user
			const userEmail = user?.email

			if (!userEmail || typeof userEmail !== 'string') {
				throw new Error('User email not found. Please login again.')
			}

			console.log('Sending verification request with:', {
				email: userEmail,
				language: currentLanguage
			})

			const response = await api.post('/users/request-verification', {
				email: userEmail,
				language: currentLanguage,
			})

			console.log('Request verification response:', response.data)
			useAuthStore.getState().setVerificationStatus(false)

			return {
				success: true,
				message: response.data.message || 'Verification email sent successfully'
			}
		} catch (error: unknown) {
			console.error('Error requesting verification:', error)

			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: {
						status: number
						statusText: string
						data: {
							message?: string
							error?: string
							code?: string
							command?: string
						}
						headers: Record<string, string>
					}
					request?: unknown
					message?: string
					code?: string
				}

				if (axiosError.response) {
					const errorData = axiosError.response.data
					let errorMessage = errorData.message || errorData.error

					if (errorData.code === 'EAUTH' || axiosError.code === 'EAUTH') {
						errorMessage = 'Email service authentication failed. Please contact support for assistance.'
						console.error('SMTP Authentication Error:', {
							code: errorData.code || axiosError.code,
							command: errorData.command,
							details: errorData.message || axiosError.message
						})
					} else {
						errorMessage = errorMessage || 'Failed to send verification email. Please try again later.'
					}

					console.error('Server responded with:', {
						status: axiosError.response.status,
						statusText: axiosError.response.statusText,
						data: errorData,
						headers: axiosError.response.headers
					})

					return {
						success: false,
						message: errorMessage
					}
				} else if (axiosError.request) {
					console.error('No response received:', axiosError.request)
					return {
						success: false,
						message: 'No response received from server. Please check your internet connection.'
					}
				} else if (axiosError.message) {
					console.error('Error setting up request:', axiosError.message)
					return {
						success: false,
						message: axiosError.message
					}
				}
			}

			if (error instanceof Error) {
				console.error('Error message:', error.message)
				return {
					success: false,
					message: error.message
				}
			}

			console.error('Unknown error type:', error)
			return {
				success: false,
				message: 'An unexpected error occurred. Please try again.'
			}
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
		} catch (error: unknown) {
			console.error('Error verifying email:', error)

			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: {
						status: number
						statusText: string
						data: unknown
					}
				}

				if (axiosError.response) {
					console.error('Server responded with:', {
						status: axiosError.response.status,
						statusText: axiosError.response.statusText,
						data: axiosError.response.data
					})
				}
			} else if (error instanceof Error) {
				console.error('Error message:', error.message)
			}

			throw error
		}
	},
}
