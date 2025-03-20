import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService } from '../services/authService'

// Define an interface for API errors
interface ApiError extends Error {
	response?: {
		data?: {
			message?: string
		}
	}
}

interface AuthState {
	token: string | null
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
	isEmailVerified: boolean
	isPendingVerification: boolean
	preferredLanguage: string | null
	theme: string | null
	login: (email: string, password: string) => Promise<void>
	loginWithGoogle: (tokenId: string) => Promise<void>
	register: (
		name: string,
		email: string,
		password: string,
		preferredLanguage: string,
		theme: string,
	) => Promise<void>
	logout: () => void
	loadUser: () => Promise<void>
	updateUser: (userData: Partial<User>) => Promise<void>
	setVerificationStatus: (isVerified: boolean, isPending: boolean) => void
	checkVerificationStatus: () => Promise<{
		isVerified: boolean
		isPending: boolean
	}>
	updateUserPreferences: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: localStorage.getItem('auth-token'),
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			isEmailVerified: false,
			isPendingVerification: false,
			preferredLanguage: null,
			theme: null,

			// Helper function to update user preferences
			updateUserPreferences: (user: User) => {
				console.log('🔵 authStore: Updating user preferences:', {
					preferredLanguage: user.preferredLanguage,
					theme: user.theme,
				})

				set({
					preferredLanguage: user.preferredLanguage || null,
					theme: user.theme || null,
				})
			},

			login: async (email, password) => {
				try {
					set({ isLoading: true, error: null })

					const { token, user } = await authService.login(
						email,
						password,
					)

					console.log('Login successful, token received:', token)
					console.log('Login successful, user data:', user)

					// Save token to localStorage (store exactly as received from server)
					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
						})

						// Update user preferences
						get().updateUserPreferences(user)

						// Check verification status after login
						await get().checkVerificationStatus()
					} else {
						throw new Error('No token received from server')
					}
				} catch (err: unknown) {
					const apiError = err as ApiError
					const errorMessage =
						apiError.response?.data?.message || 'Login failed'
					console.error('Login error:', errorMessage)

					set({
						error: errorMessage,
						isLoading: false,
						isAuthenticated: false,
						token: null,
						user: null,
					})
					throw new Error(errorMessage)
				}
			},

			loginWithGoogle: async (tokenId) => {
				try {
					set({ isLoading: true, error: null })

					const { token, user } =
						await authService.loginWithGoogle(tokenId)

					console.log(
						'Google login successful, token received:',
						token,
					)
					console.log('Google login successful, user data:', user)

					// Save token to localStorage
					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
						})

						// Update user preferences
						get().updateUserPreferences(user)

						// Check verification status after Google login
						await get().checkVerificationStatus()
					} else {
						throw new Error('No token received from server')
					}
				} catch (err: unknown) {
					const apiError = err as ApiError
					const errorMessage =
						apiError.response?.data?.message ||
						'Google login failed'
					console.error('Google login error:', errorMessage)

					set({
						error: errorMessage,
						isLoading: false,
						isAuthenticated: false,
						token: null,
						user: null,
					})
					throw new Error(errorMessage)
				}
			},

			register: async (
				name,
				email,
				password,
				preferredLanguage,
				theme,
			) => {
				try {
					set({ isLoading: true, error: null })

					// Log the registration data for debugging
					console.log('Register data:', {
						name,
						email,
						password: '******',
						preferredLanguage,
						theme,
					})

					const { token, user } = await authService.register(
						name,
						email,
						password,
						preferredLanguage,
						theme,
					)

					console.log('Register successful, token received:', token)
					console.log('Register successful, user data:', user)

					// Save token to localStorage
					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							// New users are not verified by default
							isEmailVerified: false,
							isPendingVerification: false,
						})

						// Update user preferences
						get().updateUserPreferences(user)
					} else {
						throw new Error('No token received from server')
					}
				} catch (err: unknown) {
					const apiError = err as ApiError
					const errorMessage =
						apiError.response?.data?.message ||
						'Registration failed'
					console.error('Registration error:', errorMessage)

					set({
						error: errorMessage,
						isLoading: false,
						isAuthenticated: false,
						token: null,
						user: null,
					})
					throw new Error(errorMessage)
				}
			},

			logout: () => {
				console.log('Logging out, clearing user data')

				// Save reference to current project ID before clearing
				const currentProjectId = localStorage.getItem('timer-storage')

				// Clear authentication data from localStorage first
				localStorage.removeItem('auth-token')
				localStorage.removeItem('auth-storage')

				// If there was an active project, clean it from localStorage
				// to prevent loading previous user's project
				if (currentProjectId) {
					try {
						const timerData = JSON.parse(currentProjectId)
						// Remove only the projectId but maintain other timer settings
						if (timerData.state && timerData.state.projectId) {
							console.log(
								'Clearing current project reference:',
								timerData.state.projectId,
							)
							delete timerData.state.projectId
							localStorage.setItem(
								'timer-storage',
								JSON.stringify(timerData),
							)
						}
					} catch (error) {
						console.error('Error clearing project data:', error)
					}
				}

				// Finally, update state
				set({
					token: null,
					user: null,
					isAuthenticated: false,
					isEmailVerified: false,
					isPendingVerification: false,
					preferredLanguage: null,
					theme: null,
				})
			},

			loadUser: async () => {
				const token = localStorage.getItem('auth-token')
				console.log('loadUser called, token from localStorage:', token)

				if (!token) {
					console.log(
						'No token found, setting isAuthenticated to false',
					)
					set({ isAuthenticated: false })
					return
				}

				try {
					set({ isLoading: true, token })

					const user = await authService.getProfile()
					console.log('User profile loaded:', user)

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
					})

					// Update user preferences
					get().updateUserPreferences(user)

					// Check verification status after loading user
					await get().checkVerificationStatus()
				} catch (err: unknown) {
					console.error('Error loading user:', err)
					localStorage.removeItem('auth-token')
					const apiError = err as ApiError
					set({
						token: null,
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error:
							apiError.response?.data?.message ||
							'Failed to load user',
					})
				}
			},

			updateUser: async (userData) => {
				try {
					console.log(
						'⚪ authStore: Updating user with data:',
						userData,
					)
					set({ isLoading: true, error: null })

					const updatedUser =
						await authService.updateProfile(userData)
					console.log(
						'🟢 authStore: User updated successfully:',
						updatedUser,
					)

					set({
						user: updatedUser,
						isLoading: false,
					})

					// Update user preferences
					get().updateUserPreferences(updatedUser)
				} catch (err: unknown) {
					console.error('🔴 authStore: Error updating user:', err)
					const apiError = err as ApiError
					const errorMessage =
						apiError.response?.data?.message ||
						'Failed to update user'

					set({
						error: errorMessage,
						isLoading: false,
					})
					throw new Error(errorMessage)
				}
			},

			// Function to set verification status
			setVerificationStatus: (isVerified, isPending) => {
				console.log('⚪ authStore: Setting verification status:', {
					isVerified,
					isPending,
				})
				const currentState = get()
				console.log('🔵 authStore: Current verification state:', {
					isEmailVerified: currentState.isEmailVerified,
					isPendingVerification: currentState.isPendingVerification,
				})

				set({
					isEmailVerified: isVerified,
					isPendingVerification: isPending,
				})

				console.log('🟢 authStore: Verification status set to:', {
					isVerified,
					isPending,
				})
			},

			// Function to check verification status
			checkVerificationStatus: async () => {
				console.log('⚪ authStore: Checking verification status...')
				const currentState = get()
				console.log(
					'🔵 authStore: Current verification state before check:',
					{
						isEmailVerified: currentState.isEmailVerified,
						isPendingVerification:
							currentState.isPendingVerification,
					},
				)

				try {
					const response = await import(
						'../services/emailVerificationService'
					).then((module) =>
						module.emailVerificationService.checkVerificationStatus(),
					)

					const isVerified = response.isVerified
					const isPending = response.isPending

					console.log('🟢 authStore: Verification check completed:', {
						isVerified,
						isPending,
					})

					set({
						isEmailVerified: isVerified,
						isPendingVerification: isPending,
					})

					console.log(
						'🟢 authStore: Verification state updated in store',
					)

					return { isVerified, isPending }
				} catch (err: unknown) {
					console.error(
						'🔴 authStore: Error checking verification status:',
						err,
					)
					// Don't change the state on error
					return {
						isVerified: get().isEmailVerified,
						isPending: get().isPendingVerification,
					}
				}
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => {
				console.log('🔵 Persisting auth state with values:', {
					token: state.token ? '(token exists)' : null,
					isEmailVerified: state.isEmailVerified,
					isPendingVerification: state.isPendingVerification,
					preferredLanguage: state.preferredLanguage,
					theme: state.theme,
				})

				return {
					token: state.token,
					// Now also persist the verification status
					isEmailVerified: state.isEmailVerified,
					isPendingVerification: state.isPendingVerification,
					// Also persist user preferences
					preferredLanguage: state.preferredLanguage,
					theme: state.theme,
					// Don't persist isAuthenticated, as it should be verified on load
					isAuthenticated: false,
				}
			},
			onRehydrateStorage: () => (state) => {
				if (state) {
					console.log('🔵 Rehydrated auth state with values:', {
						isEmailVerified: state.isEmailVerified,
						isPendingVerification: state.isPendingVerification,
						isAuthenticated: state.isAuthenticated,
						preferredLanguage: state.preferredLanguage,
						theme: state.theme,
					})
				} else {
					console.log('🔴 Failed to rehydrate auth state')
				}
			},
		},
	),
)
