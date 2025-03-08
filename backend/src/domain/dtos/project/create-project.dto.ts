import { z } from 'zod'

const CreateProjectSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().optional(),
    color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
            message: 'Invalid color format (should be hex)',
        })
        .default('#3498db'),
    client: z.string().optional(),
    status: z.enum(['active', 'archived']).default('active'),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export class CreateProjectDTO {
    constructor(
        public readonly name: string,
        public readonly description: string = '',
        public readonly color: string = '#3498db',
        public readonly client?: string,
        public readonly status: 'active' | 'archived' = 'active'
    ) {}

    static create(
        props: Record<string, unknown>
    ): [string?, CreateProjectDTO?] {
        const result = CreateProjectSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, description = '', color, client, status } = result.data

        return [
            undefined,
            new CreateProjectDTO(name, description, color, client, status),
        ]
    }
}
