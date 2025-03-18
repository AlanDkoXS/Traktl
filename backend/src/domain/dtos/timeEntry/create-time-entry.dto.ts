import { z } from 'zod'

const CreateTimeEntrySchema = z.object({
	project: z.string({ message: 'Project is required' }),
	task: z.string().optional(),
	tags: z.array(z.string()).optional(),
	startTime: z.coerce.date(),
	endTime: z.coerce.date().optional(),
	duration: z.number().optional(),
	notes: z.string().optional(),
	isRunning: z.boolean().default(false),
})

export type CreateTimeEntryInput = z.infer<typeof CreateTimeEntrySchema>

export class CreateTimeEntryDTO {
	constructor(
		public readonly project: string,
		public readonly startTime: Date,
		public readonly task?: string,
		public readonly tags?: string[],
		public readonly endTime?: Date,
		public readonly duration?: number,
		public readonly notes: string = '',
		public readonly isRunning: boolean = false,
	) {}

	static create(
		props: Record<string, unknown>,
	): [string?, CreateTimeEntryDTO?] {
		const result = CreateTimeEntrySchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const {
			project,
			startTime,
			task,
			tags,
			endTime,
			duration,
			notes = '',
			isRunning,
		} = result.data

		return [
			undefined,
			new CreateTimeEntryDTO(
				project,
				startTime,
				task,
				tags,
				endTime,
				duration,
				notes,
				isRunning,
			),
		]
	}
}
