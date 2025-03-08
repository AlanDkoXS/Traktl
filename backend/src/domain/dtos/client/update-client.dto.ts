import { z } from 'zod'

const UpdateClientSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    contactInfo: z.string().optional(),
    color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
            message: 'Invalid color format (should be hex)',
        })
        .optional(),
})

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>

export class UpdateClientDTO {
    constructor(
        public readonly name?: string,
        public readonly contactInfo?: string,
        public readonly color?: string
    ) {}

    static create(props: Record<string, unknown>): [string?, UpdateClientDTO?] {
        const result = UpdateClientSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { name, contactInfo, color } = result.data

        return [undefined, new UpdateClientDTO(name, contactInfo, color)]
    }
}
