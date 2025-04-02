export interface EmailVerificationToken {
	token: string
	expiresAt: Date
}

export interface User {
	_id: string
	name: string
	email: string
	password: string
	preferredLanguage: 'es' | 'en' | 'tr'
	theme: 'light' | 'dark'
	defaultTimerPreset?: string
	createdAt: Date
	updatedAt: Date
	googleId?: string
	picture?: string
	isVerified?: boolean
	isActive?: boolean
	deletedAt?: Date
	emailVerificationToken?: EmailVerificationToken
	comparePassword?(password: string): boolean
	lastVerificationRequest?: Date
}

export interface UserEntity {
	id?: string
	name: string
	email: string
	password: string
	preferredLanguage: 'es' | 'en' | 'tr'
	theme: 'light' | 'dark'
	defaultTimerPreset?: string
	createdAt: Date
	updatedAt: Date
	googleId?: string
	picture?: string
	isVerified?: boolean
	isActive?: boolean
	deletedAt?: Date
	emailVerificationToken?: EmailVerificationToken
	comparePassword?(password: string): boolean
}
