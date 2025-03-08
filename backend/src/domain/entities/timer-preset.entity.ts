export interface TimerPreset {
    _id: string
    name: string
    workDuration: number // in minutes
    breakDuration: number // in minutes
    repetitions: number
    user: string
    createdAt: Date
    updatedAt: Date
}

export interface TimerPresetEntity extends Omit<TimerPreset, '_id'> {
    id?: string
}
