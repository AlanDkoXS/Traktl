import mongoose, { Schema, Document } from 'mongoose'

export interface ITag extends Document {
	name: string
	color: string
	user: mongoose.Types.ObjectId
	createdAt: Date
	updatedAt: Date
}

const TagSchema = new Schema<ITag>(
	{
		name: {
			type: String,
			required: [true, 'Tag name is required'],
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

export const Tag = mongoose.model<ITag>('Tag', TagSchema)
