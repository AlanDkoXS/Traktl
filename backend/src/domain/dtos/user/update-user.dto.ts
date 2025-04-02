import { z } from 'zod'

const UpdateUserSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }).optional(),
	email: z.string().email({ message: 'Invalid email format' }).optional(),
	preferredLanguage: z.enum(['es', 'en', 'tr']).optional(),
	theme: z.enum(['light', 'dark']).optional(),
	defaultTimerPreset: z.string().optional(),
	picture: z.string().optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export class UpdateUserDTO {
	constructor(
		public readonly name?: string,
		public readonly email?: string,
		public readonly preferredLanguage?: 'es' | 'en' | 'tr',
		public readonly theme?: 'light' | 'dark',
		public readonly defaultTimerPreset?: string,
		public readonly picture?: string,
	) {}

	static create(props: Record<string, unknown>): [string?, UpdateUserDTO?] {
		const result = UpdateUserSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const {
			name,
			email,
			preferredLanguage,
			theme,
			defaultTimerPreset,
			picture,
		} = result.data

		return [
			undefined,
			new UpdateUserDTO(
				name,
				email,
				preferredLanguage,
				theme,
				defaultTimerPreset,
				picture,
			),
		]
	}
}
