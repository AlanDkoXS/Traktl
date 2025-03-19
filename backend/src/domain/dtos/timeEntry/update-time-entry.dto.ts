import { z } from 'zod'

const UpdateTimeEntrySchema = z.object({
	project: z.string().optional(),
	task: z.string().optional(),
	tags: z.array(z.string()).optional(),
	startTime: z.coerce.date().optional(),
	endTime: z.coerce.date().optional(),
	duration: z.number().optional(),
	notes: z.string().optional(),
	isRunning: z.boolean().optional(),
	updatedAt: z.coerce.date().optional(),
})

export type UpdateTimeEntryInput = z.infer<typeof UpdateTimeEntrySchema>

export class UpdateTimeEntryDTO {
	constructor(
		public readonly project?: string,
		public readonly task?: string,
		public readonly tags?: string[],
		public readonly startTime?: Date,
		public readonly endTime?: Date,
		public readonly duration?: number,
		public readonly notes?: string,
		public readonly isRunning?: boolean,
		public readonly updatedAt?: Date,
	) {}

	static create(
		props: Record<string, unknown>,
	): [string?, UpdateTimeEntryDTO?] {
		const result = UpdateTimeEntrySchema.safeParse(props)
		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')
			return [errorMessages, undefined]
		}
		
		const {
			project,
			task,
			tags,
			startTime,
			endTime,
			duration,
			notes,
			isRunning,
			updatedAt,
		} = result.data
		
		return [
			undefined,
			new UpdateTimeEntryDTO(
				project,
				task,
				tags,
				startTime,
				endTime,
				duration,
				notes,
				isRunning,
				updatedAt,
			),
		]
	}
}
