import mongoose, { Schema, Document } from 'mongoose'

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

export interface ITask extends Document {
    name: string
    description: string
    project: mongoose.Types.ObjectId
    status: TaskStatus
    createdAt: Date
    updatedAt: Date
    user: mongoose.Types.ObjectId
}

const TaskSchema = new Schema<ITask>(
    {
        name: {
            type: String,
            required: [true, 'Task name is required'],
        },
        description: {
            type: String,
            default: '',
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID is required'],
        },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.PENDING,
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
    }
)

export const Task = mongoose.model<ITask>('Task', TaskSchema)
