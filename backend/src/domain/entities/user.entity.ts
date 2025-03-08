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
    comparePassword?(password: string): boolean
}

export interface UserEntity extends Omit<User, '_id' | 'comparePassword'> {
    id?: string
    comparePassword?(password: string): boolean
}
