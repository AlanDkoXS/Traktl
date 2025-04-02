export interface EmailVerificationToken {
	token: string
	expiresAt: string
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
	createdAt: string
	updatedAt: string
}

export interface Client {
	id: string
	name: string
	email: string
	phone?: string
	address?: string
	notes?: string
	createdAt: string
	updatedAt: string
}

export interface Project {
	id: string
	name: string
	description?: string
	clientId: string
	status: 'active' | 'completed' | 'archived'
	color?: string
	createdAt: string
	updatedAt: string
}

export interface Task {
	id: string
	name: string
	description?: string
	projectId: string
	status: 'pending' | 'in-progress' | 'completed'
	userId: string
	dueDate?: string
	priority: 'low' | 'medium' | 'high'
	createdAt: string
	updatedAt: string
}

export interface TimeEntry {
	id: string
	taskId: string
	userId: string
	startTime: string
	endTime?: string
	duration: number
	description?: string
	createdAt: string
	updatedAt: string
}

export interface Tag {
	id: string
	name: string
	color?: string
	createdAt: string
	updatedAt: string
}

export interface TimerPreset {
	id: string
	name: string
	duration: number
	userId: string
	createdAt: string
	updatedAt: string
}

export interface ApiResponse<T> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface LoadingState {
	isLoading: boolean
	error: string | null
}

export interface TaskFilters {
	status?: Task['status']
	priority?: Task['priority']
	projectId?: string
	userId?: string
}

export interface TimeEntryFilters {
	startDate?: string
	endDate?: string
	projectId?: string
	taskId?: string
	userId?: string
}
