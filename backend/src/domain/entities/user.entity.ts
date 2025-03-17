export interface emailEmailVerificationToken {
  token: string;
  expiresAt: Date;
}

export interface User {
    _id: string
    name: string
    email: string
    password: string
    preferredLanguage: 'es' | 'en'
    theme: 'light' | 'dark'
    defaultTimerPreset?: string
    createdAt: Date
    updatedAt: Date
    googleId?: string
    picture?: string
    isVerified?: boolean
    emailEmailVerificationToken?: emailEmailVerificationToken
    comparePassword?(password: string): boolean
}

export interface UserEntity {
    id?: string
    name: string
    email: string
    password: string
    preferredLanguage: 'es' | 'en'
    theme: 'light' | 'dark'
    defaultTimerPreset?: string
    createdAt: Date
    updatedAt: Date
    googleId?: string
    picture?: string
    isVerified?: boolean
    emailEmailVerificationToken?: emailEmailVerificationToken
    comparePassword?(password: string): boolean
}
