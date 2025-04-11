import { Socket } from 'socket.io'
import { JwtAdapter } from '../../config'

interface JwtPayload {
	id: string
}

export const socketAuthMiddleware = async (
	socket: Socket,
	next: (err?: Error) => void,
) => {
	try {
		const token = socket.handshake.auth.token

		if (!token) {
			return next(new Error('Authentication error: Token missing'))
		}

		const payload = await JwtAdapter.validateToken<JwtPayload>(token)

		if (!payload) {
			return next(new Error('Authentication error: Invalid token'))
		}

		socket.data.user = { id: payload.id }
		socket.data.userId = payload.id

		console.log(`Socket ${socket.id} authenticated for user ${payload.id}`)

		next()
	} catch (error) {
		console.error('Socket authentication error:', error)
		next(new Error('Authentication error: Unable to validate token'))
	}
}
