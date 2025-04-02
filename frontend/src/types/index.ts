export interface EmailVerificationToken {
	token: string
	expiresAt: Date
}

export interface User {
	id: string
	name: string
	email: string
	preferredLanguage: 'es' | 'en' | 'tr'
	theme: 'light' | 'dark'
	picture?: string
	isVerified?: boolean
	emailVerificationToken?: EmailVerificationToken
}

export interface Client {
	id: string
	name: string
}

export interface Task {
	id: string
	name: string
	description: string
	project: string
	status: 'pending' | 'in-progress' | 'completed'
	user: string
	createdAt: Date
	updatedAt: Date
}
