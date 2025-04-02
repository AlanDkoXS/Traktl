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
	setVerificationStatus: (isVerified: boolean, emailVerificationToken?: { token: string; expiresAt: Date }) => void
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

			// Helper function to update user preferences
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

					// Clear all user data and redirect to login
					localStorage.removeItem('auth-token')
					localStorage.removeItem('auth-storage')

					// Reset timerStore state
					import('../store/timerStore').then(({ useTimerStore }) => {
						useTimerStore.getState().reset()
					})

					// Clear projects
					import('../store/projectStore').then(({ useProjectStore }) => {
						useProjectStore.getState().clearProjects()
					})

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
					const errorMessage = apiError.response?.data?.message || 'Failed to delete account'
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

					// Save token to localStorage (store exactly as received from server)
					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							// Set verification status based on email verification token
							isEmailVerified: !!user.emailVerificationToken?.token,
						})

						// Update user preferences
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

					// Save token to localStorage
					if (token) {
						localStorage.setItem('auth-token', token)

						set({
							token,
							user,
							isAuthenticated: true,
							isLoading: false,
							// Set verification status based on email verification token
							isEmailVerified: !!user.emailVerificationToken?.token,
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
							isEmailVerified: !!user.emailVerificationToken?.token,
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

				// Save reference to current timer data before clearing
				const timerData = localStorage.getItem('timer-storage')

				// Clear authentication data from localStorage first
				localStorage.removeItem('auth-token')
				localStorage.removeItem('auth-storage')

				// Reset timerStore state directly - this completely resets the timer state
				import('../store/timerStore').then(({ useTimerStore }) => {
					useTimerStore.getState().reset();
					console.log('Timer store reset directly');
				});

				// Also clear any other stores that might contain user data
				import('../store/projectStore').then(({ useProjectStore }) => {
					useProjectStore.getState().clearProjects();
					console.log('Projects cleared');
				}).catch(err => console.error('Error clearing projects:', err));

				// Clear time entries
				import('../store/timeEntryStore').then(({ useTimeEntryStore }) => {
					useTimeEntryStore.getState().clearTimeEntries();
					console.log('Time entries cleared');
				}).catch(err => console.error('Error clearing time entries:', err));

				// Reset localStorage data for timer
				if (timerData) {
					try {
						const parsedTimerData = JSON.parse(timerData)
						// Reset the timer state completely to default values
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
								JSON.stringify(parsedTimerData)
							)
						}
					} catch (error) {
						console.error('Error resetting timer data:', error)
					}
				}

				// Finally, update state
				set({
					token: null,
					user: null,
					isAuthenticated: false,
					isEmailVerified: false,
					preferredLanguage: null,
					theme: null,
				})

				// Force a page reload to ensure all components reset their state
				window.location.href = '/login';
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

					// Verificar explícitamente si el usuario tiene token de verificación
					const hasToken = !!user.emailVerificationToken?.token;
					console.log('User verification token status:', {
						hasToken,
						token: user.emailVerificationToken?.token,
						userId: user.id
					});

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						// Set verification status based on email verification token
						isEmailVerified: hasToken,
					})

					// Asegurar que el checkVerificationStatus se ejecute para sincronizar estado
					setTimeout(() => {
						get().checkVerificationStatus()
						.then(result => {
							console.log('Verification check after loadUser:', result);
						})
						.catch(error => {
							console.error('Error in verification check after loadUser:', error);
						});
					}, 500);

					// Update user preferences
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
						// Update verification status based on email verification token
						isEmailVerified: !!updatedUser.emailVerificationToken?.token,
					})

					// Update user preferences
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

			// Function to set verification status
			setVerificationStatus: (isVerified, emailVerificationToken) => {
				console.log('Setting verification status:', {
					isVerified,
					emailVerificationToken,
					currentUser: get().user
				})

				// Update user object if available
				if (get().user) {
					// Actualizar ambos campos: isVerified y emailVerificationToken si es necesario
					const currentUser = get().user!;

					// Si está verificado y no tiene token, usar el proporcionado o crear uno dummy
					let updatedEmailVerificationToken = emailVerificationToken;
					if (isVerified && !updatedEmailVerificationToken) {
						updatedEmailVerificationToken = {
							token: 'verified',
							expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far future
						};
					}

					// Asegurarse de mantener el ID del usuario intacto
					set({
						user: {
							...currentUser,
							id: currentUser.id, // Asegurar que el ID se mantiene
							isVerified: isVerified,
							emailVerificationToken: isVerified ? updatedEmailVerificationToken : undefined,
						},
						isEmailVerified: isVerified,
					})

					console.log('User object after verification update:', get().user);
				} else {
					set({
						isEmailVerified: isVerified,
					})
				}

				console.log('Verification status set to:', {
					isVerified,
					user: get().user
				})
			},

			// Function to check verification status
			checkVerificationStatus: async () => {
				console.log('Checking verification status...')
				const currentUser = get().user

				console.log('Current user before verification check:', {
					hasUser: !!currentUser,
					userId: currentUser?.id,
					userEmail: currentUser?.email,
					hasToken: !!currentUser?.emailVerificationToken?.token,
					isEmailVerified: get().isEmailVerified
				})

				try {
					// Siempre intentar obtener el estado más reciente del servidor
					const response = await import(
						'../services/emailVerificationService'
					).then((module) =>
						module.emailVerificationService.checkVerificationStatus(),
					)

					const isVerified = response.isVerified

					console.log('Verification status from server:', {
						isVerified,
					})

					// Update the user object if available
					if (currentUser) {
						set({
							isEmailVerified: isVerified,
							user: {
								...currentUser,
								id: currentUser.id, // Asegurar que el ID se mantiene
								isVerified: isVerified,
								// Si está verificado, asegurar que tenga un token
								emailVerificationToken: isVerified
									? (currentUser.emailVerificationToken || {
										token: 'verified',
										expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
									})
									: undefined
							}
						})

						// Validar que el objeto de usuario se actualizó correctamente
						const updatedUser = get().user;
						console.log('User after verification update:', {
							userId: updatedUser?.id,
							isVerified: updatedUser?.isVerified,
							hasToken: !!updatedUser?.emailVerificationToken?.token,
							token: updatedUser?.emailVerificationToken?.token
						});
					} else {
						set({
							isEmailVerified: isVerified
						})
					}

					return { isVerified }
				} catch (err: unknown) {
					console.error('Error checking verification status:', err)

					// Si hay un error al verificar con el servidor, usamos los datos locales
					if (currentUser) {
						// User is verified if they have an email verification token or isVerified is true
						const isVerified = !!currentUser.emailVerificationToken?.token || !!currentUser.isVerified

						set({
							isEmailVerified: isVerified
						})

						return { isVerified }
					}

					// Don't change the state on error
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
					// Now also persist the verification status
					isEmailVerified: state.isEmailVerified,
					// Also persist user preferences
					preferredLanguage: state.preferredLanguage,
					theme: state.theme,
					// Don't persist isAuthenticated, as it should be verified on load
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
