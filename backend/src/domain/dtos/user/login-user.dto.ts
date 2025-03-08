import { z } from 'zod'

const LoginUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(1, { message: 'Password is required' }),
})

export type LoginUserInput = z.infer<typeof LoginUserSchema>

export class LoginUserDTO {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {}

    static create(props: Record<string, unknown>): [string?, LoginUserDTO?] {
        const result = LoginUserSchema.safeParse(props)

        if (!result.success) {
            const errorMessages = result.error.errors
                .map((error) => `${error.path.join('.')}: ${error.message}`)
                .join(', ')

            return [errorMessages, undefined]
        }

        const { email, password } = result.data

        return [undefined, new LoginUserDTO(email, password)]
    }
}
