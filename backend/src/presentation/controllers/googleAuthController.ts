class GoogleAuthController extends BaseController {
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