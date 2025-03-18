import { z } from 'zod'

const UpdateTagSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }).optional(),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
			message: 'Invalid color format (should be hex)',
		})
		.optional(),
})

export type UpdateTagInput = z.infer<typeof UpdateTagSchema>

export class UpdateTagDTO {
	constructor(
		public readonly name?: string,
		public readonly color?: string,
	) {}

	static create(props: Record<string, unknown>): [string?, UpdateTagDTO?] {
		const result = UpdateTagSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { name, color } = result.data

		return [undefined, new UpdateTagDTO(name, color)]
	}
}
