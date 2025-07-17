import { Request, Response, NextFunction } from 'express'
import { JwtAdapter } from '../../config'
import '../../domain/types/request-extension'

interface JwtPayload {
	id: string
}

export const validateJWT = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const authorization = req.header('Authorization')

		if (!authorization) {
			res.status(401).json({ error: 'No token provided' })
			return
		}

		if (!authorization.startsWith('Bearer ')) {
			res.status(401).json({ error: 'Invalid token format' })
			return
		}

		const token = authorization.split(' ')[1]

		const payload = await JwtAdapter.validateToken<JwtPayload>(token)

		if (!payload) {
			res.status(401).json({ error: 'Invalid token' })
			return
		}

		req.user = { id: payload.id }
		next()
	} catch (error) {
		res.status(401).json({ error: 'Unauthorized' })
	}
}