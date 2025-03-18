import { z } from 'zod'

const CreateTagSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
			message: 'Invalid color format (should be hex)',
		})
		.default('#2ecc71'),
})

export type CreateTagInput = z.infer<typeof CreateTagSchema>

export class CreateTagDTO {
	constructor(
		public readonly name: string,
		public readonly color: string = '#2ecc71',
	) {}

	static create(props: Record<string, unknown>): [string?, CreateTagDTO?] {
		const result = CreateTagSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { name, color } = result.data

		return [undefined, new CreateTagDTO(name, color)]
	}
}
