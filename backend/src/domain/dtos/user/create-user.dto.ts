import { z } from 'zod'

const CreateUserSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	email: z.string().email({ message: 'Invalid email format' }),
	password: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters' }),
	preferredLanguage: z.enum(['es', 'en']).default('en'),
	theme: z.enum(['light', 'dark']).default('light'),
	defaultTimerPreset: z.string().optional(),
	googleId: z.string().optional(),
	picture: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export class CreateUserDTO {
	constructor(
		public readonly name: string,
		public readonly email: string,
		public readonly password: string,
		public readonly preferredLanguage: 'es' | 'en',
		public readonly theme: 'light' | 'dark',
		public readonly defaultTimerPreset?: string,
		public readonly googleId?: string,
		public readonly picture?: string,
	) {}

	static create(props: Record<string, unknown>): [string?, CreateUserDTO?] {
		const result = CreateUserSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const {
			name,
			email,
			password,
			preferredLanguage,
			theme,
			defaultTimerPreset,
			googleId,
			picture,
		} = result.data

		return [
			undefined,
			new CreateUserDTO(
				name,
				email,
				password,
				preferredLanguage,
				theme,
				defaultTimerPreset,
				googleId,
				picture,
			),
		]
	}
}
