import api from './api'
import { User } from '../types'

export interface LoginResponse {
	token: string
	user: User
}

export interface RegisterResponse {
	token: string
	user: User
}

export const authService = {
	// Login
	login: async (email: string, password: string): Promise<LoginResponse> => {
		try {
			console.log('Sending login request with:', {
				email,
				password: '******',
			})
			const response = await api.post('/users/login', { email, password })

			console.log('Login API response:', response.data)

			// Check how the response is structured and extract token and user accordingly
			let token, user

			if (response.data.token) {
				// Format 1: { token, user }
				token = response.data.token
				user = response.data.data || response.data.user
			} else if (response.data.data?.token) {
				// Format 2: { data: { token, user } }
				token = response.data.data.token
				user = response.data.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			return { token, user }
		} catch (error) {
			console.error('Login error in service:', error)
			throw error
		}
	},

	// Google Login
	loginWithGoogle: async (tokenId: string): Promise<LoginResponse> => {
		try {
			console.log('Sending Google login request with token')
			const response = await api.post('/users/google', { token: tokenId })

			console.log('Google login API response:', response.data)

			// Extract token and user data
			let token, user

			if (response.data.token) {
				token = response.data.token
				user = response.data.user || response.data.data
			} else if (response.data.data?.token) {
				token = response.data.data.token
				user = response.data.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			return { token, user }
		} catch (error) {
			console.error('Google login error in service:', error)
			throw error
		}
	},

	// Register
	register: async (
		name: string,
		email: string,
		password: string,
		preferredLanguage: string = 'en',
		theme: string = 'light',
	): Promise<RegisterResponse> => {
		try {
			// Make sure we only send 'light' or 'dark', not 'system'
			const safeTheme =
				theme === 'light' || theme === 'dark' ? theme : 'light'

			const response = await api.post('/users/register', {
				name,
				email,
				password,
				preferredLanguage,
				theme: safeTheme,
			})

			console.log('Register API response:', response.data)

			// Handle different response formats
			let token, user

			if (response.data.token) {
				token = response.data.token
				user = response.data.user || response.data.data
			} else if (response.data.data?.token) {
				token = response.data.data.token
				user = response.data.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			return { token, user }
		} catch (error) {
			console.error('Register error in service:', error)
			throw error
		}
	},

	// Get user profile
	getProfile: async (): Promise<User> => {
		try {
			const response = await api.get('/users/profile')
			console.log('Profile API response:', response.data)

			// Handle different response formats
			let user

			if (response.data.user) {
				user = response.data.user
			} else if (response.data.data) {
				user = response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			return user
		} catch (error) {
			console.error('Get profile error in service:', error)
			throw error
		}
	},

	// Update user profile
	updateProfile: async (userData: Partial<User>): Promise<User> => {
		try {
			// Make sure we only send 'light' or 'dark', not 'system'
			const safeUserData = { ...userData }
			if (
				safeUserData.theme &&
				safeUserData.theme !== 'light' &&
				safeUserData.theme !== 'dark'
			) {
				safeUserData.theme = 'light'
			}

			const response = await api.put('/users/profile', safeUserData)

			// Handle different response formats
			let user

			if (response.data.user) {
				user = response.data.user
			} else if (response.data.data) {
				user = response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			return user
		} catch (error) {
			console.error('Update profile error in service:', error)
			throw error
		}
	},

	// Change password
	changePassword: async (
		currentPassword: string,
		newPassword: string,
	): Promise<void> => {
		try {
			await api.put('/users/change-password', {
				currentPassword,
				newPassword,
			})
		} catch (error) {
			console.error('Change password error in service:', error)
			throw error
		}
	},

	// Request password reset
	requestPasswordReset: async (email: string): Promise<void> => {
		try {
			await api.post('/users/forgot-password', { email })
		} catch (error) {
			// Do not throw an error here for security reasons
			// Even if the email doesn't exist, we don't want to reveal that
			console.log('Request password reset completed')
		}
	},

	// Reset password with token
	resetPassword: async (token: string, password: string): Promise<void> => {
		try {
			await api.post('/users/reset-password', { token, password })
		} catch (error) {
			console.error('Reset password error in service:', error)
			throw error
		}
	},
}
