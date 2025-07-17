import { Request, Response } from 'express'
import { z } from 'zod'
import { BaseController } from './baseController'
import { UserService } from '../../domain/services/user/userService'

// Define GoogleAuthService
class GoogleAuthService {
    constructor(private userService: UserService) {}

    async loginWithGoogle(token: string) {
        // Implement Google authentication logic here
        // This is a placeholder implementation
        return { user: { id: 'google-user-id', email: 'google-user@example.com' }, token: 'jwt-token' }
    }
}

// Define GoogleTokenSchema
const GoogleTokenSchema = z.object({
    token: z.string().min(1, 'Google token is required')
})

export class GoogleAuthController extends BaseController {
	private googleAuthService: GoogleAuthService

	constructor(userService: UserService) {
		super()
		this.googleAuthService = new GoogleAuthService(userService)
	}

	public googleLogin = async (req: Request, res: Response) => {
		try {
			const validationResult = GoogleTokenSchema.safeParse(req.body)

			if (!validationResult.success) {
				return res.status(400).json({
					ok: false,
					error: validationResult.error.errors
						.map((err) => `${err.path}: ${err.message}`)
						.join(', '),
				})
			}

			const { token } = validationResult.data

			const result = await this.googleAuthService.loginWithGoogle(token)

			return this.handleSuccess(res, result)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}