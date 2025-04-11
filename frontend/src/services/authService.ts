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
	login: async (email: string, password: string): Promise<LoginResponse> => {
		try {
			console.log('Sending login request with:', {
				email,
				password: '******',
			})
			const response = await api.post('/users/login', { email, password })

			console.log('Login API response:', response.data)

			let token, user

			if (response.data.ok && response.data.data) {
				if (response.data.data.token) {
					token = response.data.data.token
					user = response.data.data.user
				} else {
					token = response.data.data.token
					user = response.data.data.user
				}
			} else if (response.data.token) {
				token = response.data.token
				user = response.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			if (user) {
				console.log(
					'Extracted user data:',
					JSON.stringify(user, null, 2),
				)
			}

			return { token, user }
		} catch (error) {
			console.error('Login error in service:', error)
			throw error
		}
	},

	loginWithGoogle: async (credential: string): Promise<LoginResponse> => {
		try {
			console.log('Sending Google login request with credential')
			const response = await api.post('/users/google', {
				token: credential,
			})

			console.log('Google login API response:', response.data)

			let token, user

			if (response.data.ok && response.data.data) {
				token = response.data.data.token
				user = response.data.data.user
			} else if (response.data.token) {
				token = response.data.token
				user = response.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			console.log(
				'Extracted Google login user data:',
				JSON.stringify(user, null, 2),
			)

			return { token, user }
		} catch (error) {
			console.error('Google login error in service:', error)
			throw error
		}
	},

	register: async (
		name: string,
		email: string,
		password: string,
		preferredLanguage: string = 'en',
		theme: string = 'light',
	): Promise<RegisterResponse> => {
		try {
			const safeTheme =
				theme === 'light' || theme === 'dark' ? theme : 'light'

			const payload = {
				name,
				email,
				password,
				preferredLanguage,
				theme: safeTheme,
			}

			console.log('Register payload:', {
				...payload,
				password: '******',
			})

			const response = await api.post('/users/register', payload)

			console.log('Register API response:', response.data)

			let token, user

			if (response.data.ok && response.data.data) {
				token = response.data.data.token
				user = response.data.data.user
			} else if (response.data.token) {
				token = response.data.token
				user = response.data.user || response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			console.log(
				'Extracted register user data:',
				JSON.stringify(user, null, 2),
			)

			return { token, user }
		} catch (error) {
			console.error('Register error in service:', error)
			throw error
		}
	},

	getProfile: async (): Promise<User> => {
		try {
			const response = await api.get('/users/profile')
			console.log('Profile API response:', response.data)

			let user

			if (response.data.ok && response.data.data) {
				user = response.data.data
			} else if (response.data.user) {
				user = response.data.user
			} else if (response.data.data) {
				user = response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			console.log(
				'Extracted profile user data:',
				JSON.stringify(user, null, 2),
			)

			return user
		} catch (error) {
			console.error('Get profile error in service:', error)
			throw error
		}
	},

	updateProfile: async (userData: Partial<User>): Promise<User> => {
		try {
			const safeUserData = { ...userData }
			if (
				safeUserData.theme &&
				safeUserData.theme !== 'light' &&
				safeUserData.theme !== 'dark'
			) {
				safeUserData.theme = 'light'
			}

			const response = await api.put('/users/profile', safeUserData)

			let user

			if (response.data.ok && response.data.data) {
				user = response.data.data
			} else if (response.data.user) {
				user = response.data.user
			} else if (response.data.data) {
				user = response.data.data
			} else {
				console.error('Unexpected response format:', response.data)
				throw new Error('Invalid response format from server')
			}

			console.log(
				'Updated profile user data:',
				JSON.stringify(user, null, 2),
			)

			return user
		} catch (error) {
			console.error('Update profile error in service:', error)
			throw error
		}
	},

	changePassword: async (
		currentPassword: string,
		newPassword: string,
	): Promise<void> => {
		try {
			await api.post('/users/change-password', {
				currentPassword,
				newPassword,
			})
		} catch (error) {
			console.error('Change password error in service:', error)
			throw error
		}
	},

	deleteUser: async (): Promise<void> => {
		try {
			await api.delete('/users/profile')
		} catch (error) {
			console.error('Delete user error in service:', error)
			throw error
		}
	},

	requestPasswordReset: async (email: string): Promise<void> => {
		try {
			const currentLanguage = localStorage.getItem('i18nextLng') || 'en'
			await api.post('/users/forgot-password', {
				email,
				language: currentLanguage,
			})
		} catch {
			console.log('Request password reset completed')
		}
	},

	resetPassword: async (token: string, password: string): Promise<void> => {
		try {
			await api.post('/users/reset-password', { token, password })
		} catch (error) {
			console.error('Reset password error in service:', error)
			throw error
		}
	},
}
