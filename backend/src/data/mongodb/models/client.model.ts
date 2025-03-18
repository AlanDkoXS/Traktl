import mongoose, { Schema, Document } from 'mongoose'

export interface IClient extends Document {
	name: string
	contactInfo: string
	color: string
	createdAt: Date
	updatedAt: Date
	user: mongoose.Types.ObjectId
}

const ClientSchema = new Schema<IClient>(
	{
		name: {
			type: String,
			required: [true, 'Client name is required'],
		},
		contactInfo: {
			type: String,
			default: '',
		},
		color: {
			type: String,
			default: '#000000',
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

export const Client = mongoose.model<IClient>('Client', ClientSchema)
