import { z } from 'zod'

const RequestVerificationSchema = z.object({
	email: z.string().email({ message: 'Valid email is required' }),
    language: z.string().min(2).max(5).optional().default('en')
})

export type RequestVerificationInput = z.infer<typeof RequestVerificationSchema>

export class RequestVerificationDTO {
	constructor(
        public readonly email: string,
        public readonly language: string = 'en'
    ) {}

	static create(
		props: Record<string, unknown>,
	): [string?, RequestVerificationDTO?] {
		const result = RequestVerificationSchema.safeParse(props)

		if (!result.success) {
			const errorMessages = result.error.errors
				.map((error) => `${error.path.join('.')}: ${error.message}`)
				.join(', ')

			return [errorMessages, undefined]
		}

		const { email, language } = result.data

		return [undefined, new RequestVerificationDTO(email, language)]
	}
}
