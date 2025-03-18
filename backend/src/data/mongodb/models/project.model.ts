import mongoose, { Schema, Document } from 'mongoose'
import { Status } from './user.model'

export interface IProject extends Document {
	name: string
	description: string
	color: string
	client?: mongoose.Types.ObjectId
	createdAt: Date
	updatedAt: Date
	status: string
	user: mongoose.Types.ObjectId
}

const ProjectSchema = new Schema<IProject>(
	{
		name: {
			type: String,
			required: [true, 'Project name is required'],
		},
		description: {
			type: String,
			default: '',
		},
		color: {
			type: String,
			default: '#000000',
		},
		client: {
			type: Schema.Types.ObjectId,
			ref: 'Client',
		},
		status: {
			type: String,
			enum: ['active', 'archived'],
			default: 'active',
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
