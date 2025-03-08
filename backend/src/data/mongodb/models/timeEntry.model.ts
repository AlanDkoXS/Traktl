import mongoose, { Schema, Document } from 'mongoose'

export interface ITimeEntry extends Document {
    user: mongoose.Types.ObjectId
    project: mongoose.Types.ObjectId
    task?: mongoose.Types.ObjectId
    tags: mongoose.Types.ObjectId[]
    startTime: Date
    endTime?: Date
    duration: number
    notes: string
    createdAt: Date
    updatedAt: Date
    isRunning: boolean
}

const TimeEntrySchema = new Schema<ITimeEntry>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID is required'],
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
        },
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tag',
            },
        ],
        startTime: {
            type: Date,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            default: '',
        },
        isRunning: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export const TimeEntry = mongoose.model<ITimeEntry>(
    'TimeEntry',
    TimeEntrySchema
)
