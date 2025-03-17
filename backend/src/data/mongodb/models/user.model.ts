import mongoose, { Schema, Document } from 'mongoose'
import { encryptAdapter } from '../../../config'

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface IUser extends Document {
    name: string
    email: string
    password: string
    preferredLanguage: string
    theme: string
    defaultTimerPreset?: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
    googleId?: string
    picture?: string
    status: Status
    comparePassword(password: string): boolean
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        preferredLanguage: {
            type: String,
            enum: ['es', 'en'],
            default: 'en',
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        defaultTimerPreset: {
            type: Schema.Types.ObjectId,
            ref: 'TimerPreset',
        },
        googleId: String,
        picture: String,
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.ACTIVE,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

// Pre-save hook to hash password
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next()

    try {
        this.password = encryptAdapter.hash(this.password)
        next()
    } catch (error: any) {
        next(error)
    }
})

// Method to compare password
UserSchema.methods.comparePassword = function (password: string): boolean {
       return encryptAdapter.compare(password, this.password)
}

export const User = mongoose.model<IUser>('User', UserSchema)
