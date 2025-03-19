export interface User {
	id: string
	name: string
	email: string
	preferredLanguage: 'es' | 'en' | 'tr'
	theme: 'light' | 'dark'
	picture?: string
}

export interface Project {
	id: string
	name: string
	description: string
	color: string
	client?: string
	status: 'active' | 'archived'
	user: string
	createdAt: Date
	updatedAt: Date
}

export interface Client {
	id: string
	name: string
	projects?: string
	contactInfo: string
	color: string
	user: string
	createdAt: Date
	updatedAt: Date
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
	user: string
	project: string
	task?: string
	tags: string[]
	startTime: Date
	endTime?: Date
	duration: number
	notes: string
	isRunning: boolean
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

export type ThemeType = 'light' | 'dark' | 'system'
export type LanguageType = 'en' | 'es' | 'tr'
