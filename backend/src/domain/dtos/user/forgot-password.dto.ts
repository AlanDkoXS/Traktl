import { z } from 'zod'

const ForgotPasswordSchema = z.object({
	email: z.string().email({ message: 'Valid email is required' }),
	language: z.string().optional().default('en'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export class ForgotPasswordDTO {
	constructor(
		public readonly email: string,
		public readonly language: string = 'en'
	) {}

	static create(
		props: Record<string, unknown>,
	): [string?, ForgotPasswordDTO?] {
		const result = ForgotPasswordSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { email, language = 'en' } = result.data

		return [undefined, new ForgotPasswordDTO(email, language)]
	}
}
