import { z } from 'zod'

const VerifyEmailSchema = z.object({
	token: z.string().min(1, { message: 'Token is required' }),
})

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>

export class VerifyEmailDTO {
	constructor(public readonly token: string) {}

	static create(props: Record<string, unknown>): [string?, VerifyEmailDTO?] {
		const result = VerifyEmailSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { token } = result.data

		return [undefined, new VerifyEmailDTO(token)]
	}
}
