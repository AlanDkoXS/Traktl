import { z } from 'zod'

const UpdateProjectSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }).optional(),
	description: z.string().optional(),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
			message: 'Invalid color format (should be hex)',
		})
		.optional(),
	client: z.string().nullable().optional(),
	status: z.enum(['active', 'archived']).optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

export class UpdateProjectDTO {
	constructor(
		public readonly name?: string,
		public readonly description?: string,
		public readonly color?: string,
		public readonly client?: string | null,
		public readonly status?: 'active' | 'archived',
	) {}

	static create(
		props: Record<string, unknown>,
	): [string?, UpdateProjectDTO?] {
		const result = UpdateProjectSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { name, description, color, client, status } = result.data

		return [
			undefined,
			new UpdateProjectDTO(name, description, color, client, status),
		]
	}
}
