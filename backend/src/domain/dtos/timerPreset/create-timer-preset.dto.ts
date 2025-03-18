import { z } from 'zod'

const CreateTimerPresetSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	workDuration: z
		.number()
		.int()
		.min(1, { message: 'Work duration must be at least 1 minute' }),
	breakDuration: z
		.number()
		.int()
		.min(1, { message: 'Break duration must be at least 1 minute' }),
	repetitions: z
		.number()
		.int()
		.min(1, { message: 'Repetitions must be at least 1' })
		.default(1),
})

export type CreateTimerPresetInput = z.infer<typeof CreateTimerPresetSchema>

export class CreateTimerPresetDTO {
	constructor(
		public readonly name: string,
		public readonly workDuration: number,
		public readonly breakDuration: number,
		public readonly repetitions: number = 1,
	) {}

	static create(
		props: Record<string, unknown>,
	): [string?, CreateTimerPresetDTO?] {
		const result = CreateTimerPresetSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { name, workDuration, breakDuration, repetitions } = result.data

		return [
			undefined,
			new CreateTimerPresetDTO(
				name,
				workDuration,
				breakDuration,
				repetitions,
			),
		]
	}
}
