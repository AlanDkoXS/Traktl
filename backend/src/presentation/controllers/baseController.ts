import { Request, Response } from 'express'
import { CustomError } from '../../domain/errors/custom.errors'

export abstract class BaseController {
	protected handleError(error: unknown, res: Response): Response {
		if (error instanceof CustomError) {
			return res.status(error.statusCode).json({
				ok: false,
				message: error.message,
			})
		}

		console.error(error)
		return res.status(500).json({
			ok: false,
			message: 'Internal server error',
		})
	}

	protected handleSuccess<T>(
		res: Response,
		data: T,
		statusCode = 200,
	): Response {
		return res.status(statusCode).json({
			ok: true,
			data,
		})
	}
}
