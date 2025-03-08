import { z } from 'zod'

const CreateTaskSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().optional(),
    project: z.string({ message: 'Project is required' }),
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

export class CreateTaskDTO {
    constructor(
        public readonly name: string,
        public readonly project: string,
        public readonly description: string = '',
        public readonly status:
            | 'pending'
            | 'in-progress'
            | 'completed' = 'pending'
    ) {}

    static create(props: Record<string, unknown>): [string?, CreateTaskDTO?] {
        const result = CreateTaskSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, project, description = '', status } = result.data

        return [
            undefined,
            new CreateTaskDTO(name, project, description, status),
        ]
    }
}
