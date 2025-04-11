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
	createdAt: Date
	updatedAt: Date
	googleId?: string
	picture?: string
	status: Status
	emailVerificationToken?: {
		token: string
		expiresAt: Date
	}
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

		googleId: String,
		picture: String,
		status: {
			type: String,
			enum: Object.values(Status),
			default: Status.ACTIVE,
		},
		emailVerificationToken: {
			token: String,
			expiresAt: Date,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

UserSchema.pre('save', function (next) {
	if (!this.isModified('password')) return next()

	try {
		this.password = encryptAdapter.hash(this.password)
		next()
	} catch (error: any) {
		next(error)
	}
})

UserSchema.methods.comparePassword = function (password: string): boolean {
	return encryptAdapter.compare(password, this.password)
}

export const User = mongoose.model<IUser>('User', UserSchema)
