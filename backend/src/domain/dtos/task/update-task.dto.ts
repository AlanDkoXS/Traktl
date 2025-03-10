import { z } from 'zod'

const UpdateTaskSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    description: z.string().optional(),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Project ID must be a valid MongoDB ObjectID'
    }).optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
})

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>

export class UpdateTaskDTO {
    constructor(
        public readonly name?: string,
        public readonly description?: string,
        public readonly project?: string,
        public readonly status?: 'pending' | 'in-progress' | 'completed'
    ) {}

    static create(props: Record<string, unknown>): [string?, UpdateTaskDTO?] {
        const result = UpdateTaskSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, description, project, status } = result.data

        return [
            undefined,
            new UpdateTaskDTO(name, description, project, status),
        ]
    }
}
