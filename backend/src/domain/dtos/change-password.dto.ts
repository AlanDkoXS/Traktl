import { z } from 'zod'

export class ChangePasswordDTO {
	constructor(
		public currentPassword: string,
		public newPassword: string,
	) {}

	static create(object: {
		[key: string]: any
	}): [string?, ChangePasswordDTO?] {
		const schema = z.object({
			currentPassword: z
				.string()
				.min(6, 'Current password must be at least 6 characters'),
			newPassword: z
				.string()
				.min(6, 'New password must be at least 6 characters'),
		})

		try {
			const result = schema.parse(object)
			return [
				undefined,
				new ChangePasswordDTO(
					result.currentPassword,
					result.newPassword,
				),
			]
		} catch (error) {
			return [
				error instanceof Error ? error.message : 'Invalid input',
				undefined,
			]
		}
	}
}
