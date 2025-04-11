import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService } from '../services/authService'

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
	setVerificationStatus: (
		isVerified: boolean,
		emailVerificationToken?: { token: string; expiresAt: Date },
	) => void
	checkVerificationStatus: () => Promise<{
		isVerified: boolean
	}>
	updateUserPreferences: (user: User) => void
	deleteUser: () => Promise<void>
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
			preferredLanguage: null,
			theme: null,

			updateUserPreferences: (user: User) => {
				console.log('Updating user preferences:', {
					preferredLanguage: user.preferredLanguage,
					theme: user.theme,
				})

				set({
					preferredLanguage: user.preferredLanguage || null,
					theme: user.theme || null,
				})
			},

			deleteUser: async () => {
				try {
					set({ isLoading: true, error: null })
					await authService.deleteUser()

					localStorage.removeItem('auth-token')
					localStorage.removeItem('auth-storage')

					import('../store/timerStore').then(({ useTimerStore }) => {
						useTimerStore.getState().reset()
					})

					import('../store/projectStore').then(
						({ useProjectStore }) => {
							useProjectStore.getState().clearProjects()
						},
					)

					set({
						token: null,
						user: null,
						isAuthenticated: false,
						isLoading: false,
						isEmailVerified: false,
						preferredLanguage: null,
						theme: null,
					})

					window.location.href = '/login'
				} catch (err: unknown) {
					const apiError = err as ApiError
					const errorMessage =
						apiError.response?.data?.message ||
						'Failed to delete account'
					set({ error: errorMessage, isLoading: false })
					throw new Error(errorMessage)
				}
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

					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							isEmailVerified:
								!!user.emailVerificationToken?.token,
						})

						get().updateUserPreferences(user)
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

					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							isEmailVerified:
								!!user.emailVerificationToken?.token,
						})

						get().updateUserPreferences(user)
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

					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							isEmailVerified:
								!!user.emailVerificationToken?.token,
						})

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

				const timerData = localStorage.getItem('timer-storage')

				localStorage.removeItem('auth-token')
				localStorage.removeItem('auth-storage')

				import('../store/timerStore').then(({ useTimerStore }) => {
					useTimerStore.getState().reset()
					console.log('Timer store reset directly')
				})

				import('../store/projectStore')
					.then(({ useProjectStore }) => {
						useProjectStore.getState().clearProjects()
						console.log('Projects cleared')
					})
					.catch((err) =>
						console.error('Error clearing projects:', err),
					)

				import('../store/timeEntryStore')
					.then(({ useTimeEntryStore }) => {
						useTimeEntryStore.getState().clearTimeEntries()
						console.log('Time entries cleared')
					})
					.catch((err) =>
						console.error('Error clearing time entries:', err),
					)

				if (timerData) {
					try {
						const parsedTimerData = JSON.parse(timerData)
						if (parsedTimerData.state) {
							console.log('Resetting all timer data')
							parsedTimerData.state = {
								status: 'idle',
								mode: 'work',
								elapsed: 0,
								workDuration: 25,
								breakDuration: 5,
								repetitions: 4,
								currentRepetition: 1,
								projectId: null,
								taskId: null,
								notes: '',
								tags: [],
								workStartTime: null,
								showCompletionModal: false,
								infiniteMode: false,
								selectedEntryId: null,
							}
							localStorage.setItem(
								'timer-storage',
								JSON.stringify(parsedTimerData),
							)
						}
					} catch (error) {
						console.error('Error resetting timer data:', error)
					}
				}

				set({
					token: null,
					user: null,
					isAuthenticated: false,
					isEmailVerified: false,
					preferredLanguage: null,
					theme: null,
				})

				window.location.href = '/login'
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

					const hasToken = !!user.emailVerificationToken?.token
					console.log('User verification token status:', {
						hasToken,
						token: user.emailVerificationToken?.token,
						userId: user.id,
					})

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						isEmailVerified: hasToken,
					})

					setTimeout(() => {
						get()
							.checkVerificationStatus()
							.then((result) => {
								console.log(
									'Verification check after loadUser:',
									result,
								)
							})
							.catch((error) => {
								console.error(
									'Error in verification check after loadUser:',
									error,
								)
							})
					}, 500)

					get().updateUserPreferences(user)
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
					console.log('Updating user with data:', userData)
					set({ isLoading: true, error: null })

					const updatedUser =
						await authService.updateProfile(userData)
					console.log('User updated successfully:', updatedUser)

					set({
						user: updatedUser,
						isLoading: false,
						isEmailVerified:
							!!updatedUser.emailVerificationToken?.token,
					})

					get().updateUserPreferences(updatedUser)
				} catch (err: unknown) {
					console.error('Error updating user:', err)
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

			setVerificationStatus: (isVerified, emailVerificationToken) => {
				console.log('Setting verification status:', {
					isVerified,
					emailVerificationToken,
					currentUser: get().user,
				})

				if (get().user) {
					const currentUser = get().user!

					let updatedEmailVerificationToken = emailVerificationToken
					if (isVerified && !updatedEmailVerificationToken) {
						updatedEmailVerificationToken = {
							token: 'verified',
							expiresAt: new Date(
								Date.now() + 365 * 24 * 60 * 60 * 1000,
							), // Far future
						}
					}

					set({
						user: {
							...currentUser,
							id: currentUser.id,
							isVerified: isVerified,
							emailVerificationToken: isVerified
								? updatedEmailVerificationToken
								: undefined,
						},
						isEmailVerified: isVerified,
					})

					console.log(
						'User object after verification update:',
						get().user,
					)
				} else {
					set({
						isEmailVerified: isVerified,
					})
				}

				console.log('Verification status set to:', {
					isVerified,
					user: get().user,
				})
			},

			checkVerificationStatus: async () => {
				console.log('Checking verification status...')
				const currentUser = get().user

				console.log('Current user before verification check:', {
					hasUser: !!currentUser,
					userId: currentUser?.id,
					userEmail: currentUser?.email,
					hasToken: !!currentUser?.emailVerificationToken?.token,
					isEmailVerified: get().isEmailVerified,
				})

				try {
					const response = await import(
						'../services/emailVerificationService'
					).then((module) =>
						module.emailVerificationService.checkVerificationStatus(),
					)

					const isVerified = response.isVerified

					console.log('Verification status from server:', {
						isVerified,
					})

					if (currentUser) {
						set({
							isEmailVerified: isVerified,
							user: {
								...currentUser,
								id: currentUser.id,
								isVerified: isVerified,
								emailVerificationToken: isVerified
									? currentUser.emailVerificationToken || {
											token: 'verified',
											expiresAt: new Date(
												Date.now() +
													365 * 24 * 60 * 60 * 1000,
											),
										}
									: undefined,
							},
						})

						const updatedUser = get().user
						console.log('User after verification update:', {
							userId: updatedUser?.id,
							isVerified: updatedUser?.isVerified,
							hasToken:
								!!updatedUser?.emailVerificationToken?.token,
							token: updatedUser?.emailVerificationToken?.token,
						})
					} else {
						set({
							isEmailVerified: isVerified,
						})
					}

					return { isVerified }
				} catch (err: unknown) {
					console.error('Error checking verification status:', err)

					if (currentUser) {
						const isVerified =
							!!currentUser.emailVerificationToken?.token ||
							!!currentUser.isVerified

						set({
							isEmailVerified: isVerified,
						})

						return { isVerified }
					}

					return {
						isVerified: get().isEmailVerified,
					}
				}
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => {
				console.log('Persisting auth state with values:', {
					token: state.token ? '(token exists)' : null,
					isEmailVerified: state.isEmailVerified,
					preferredLanguage: state.preferredLanguage,
					theme: state.theme,
				})

				return {
					token: state.token,
					isEmailVerified: state.isEmailVerified,
					preferredLanguage: state.preferredLanguage,
					theme: state.theme,
					isAuthenticated: false,
				}
			},
			onRehydrateStorage: () => (state) => {
				if (state) {
					console.log('Rehydrated auth state with values:', {
						isEmailVerified: state.isEmailVerified,
						isAuthenticated: state.isAuthenticated,
						preferredLanguage: state.preferredLanguage,
						theme: state.theme,
					})
				} else {
					console.log('Failed to rehydrate auth state')
				}
			},
		},
	),
)
