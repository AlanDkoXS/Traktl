import { z } from 'zod'

const UpdateTimerPresetSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    workDuration: z
        .number()
        .int()
        .min(1, { message: 'Work duration must be at least 1 minute' })
        .optional(),
    breakDuration: z
        .number()
        .int()
        .min(1, { message: 'Break duration must be at least 1 minute' })
        .optional(),
    repetitions: z
        .number()
        .int()
        .min(1, { message: 'Repetitions must be at least 1' })
        .optional(),
})

export type UpdateTimerPresetInput = z.infer<typeof UpdateTimerPresetSchema>

export class UpdateTimerPresetDTO {
    constructor(
        public readonly name?: string,
        public readonly workDuration?: number,
        public readonly breakDuration?: number,
        public readonly repetitions?: number
    ) {}

    static create(
        props: Record<string, unknown>
    ): [string?, UpdateTimerPresetDTO?] {
        const result = UpdateTimerPresetSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, workDuration, breakDuration, repetitions } = result.data

        return [
            undefined,
            new UpdateTimerPresetDTO(
                name,
                workDuration,
                breakDuration,
                repetitions
            ),
        ]
    }
}
