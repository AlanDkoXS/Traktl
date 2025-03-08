import { z } from 'zod'

const CreateClientSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    contactInfo: z.string().optional(),
    color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
            message: 'Invalid color format (should be hex)',
        })
        .default('#e74c3c'),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>

export class CreateClientDTO {
    constructor(
        public readonly name: string,
        public readonly contactInfo: string = '',
        public readonly color: string = '#e74c3c'
    ) {}

    static create(props: Record<string, unknown>): [string?, CreateClientDTO?] {
        const result = CreateClientSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, contactInfo = '', color } = result.data

        return [undefined, new CreateClientDTO(name, contactInfo, color)]
    }
}
