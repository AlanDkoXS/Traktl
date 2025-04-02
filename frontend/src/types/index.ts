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
	contactInfo?: string
	color: string
	user: string
	createdAt: Date
	updatedAt: Date
	projects?: string[]
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

export interface TimerPreset {
	id: string
	name: string
	workDuration: number
	breakDuration: number
	repetitions: number
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface Tag {
	id: string
	name: string
	color: string
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface TimeEntry {
	id: string
	project: string
	task?: string
	startTime: Date
	endTime?: Date
	duration: number
	notes?: string
	isRunning?: boolean
	tags: string[]
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface Project {
	id: string
	name: string
	description: string
	color: string
	client: string | null | undefined
	status: 'active' | 'archived'
	user: string
	createdAt: Date
	updatedAt: Date
}
