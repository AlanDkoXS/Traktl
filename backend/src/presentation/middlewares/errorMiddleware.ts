import { ErrorRequestHandler } from 'express'
import { CustomError } from '../../domain/errors/custom.errors'

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
	console.error(err)

	if (err instanceof CustomError) {
		res.status(err.statusCode).json({
			ok: false,
			message: err.message,
		})
	} else {
		res.status(500).json({
			ok: false,
			message: 'Internal server error',
		})
	}

	next()
}
