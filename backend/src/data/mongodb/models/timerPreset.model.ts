import mongoose, { Schema, Document } from 'mongoose'

export interface ITimerPreset extends Document {
    name: string
    workDuration: number
    breakDuration: number
    repetitions: number
    user: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const TimerPresetSchema = new Schema<ITimerPreset>(
    {
        name: {
            type: String,
            required: [true, 'Timer preset name is required'],
        },
        workDuration: {
            type: Number,
            required: [true, 'Work duration is required'],
            min: [1, 'Work duration must be at least 1 minute'],
        },
        breakDuration: {
            type: Number,
            required: [true, 'Break duration is required'],
            min: [0, 'Break duration must be at least 0 minutes'],
        },
        repetitions: {
            type: Number,
            required: [true, 'Number of repetitions is required'],
            min: [1, 'Number of repetitions must be at least 1'],
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

export const TimerPreset = mongoose.model<ITimerPreset>(
    'TimerPreset',
    TimerPresetSchema
)
