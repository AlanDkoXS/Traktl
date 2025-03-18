import jwt from 'jsonwebtoken'
import { envs } from './envs'

const JWT_SEED = envs.JWT_SEED

export interface JwtPayload {
	id: string
	iat?: number
	exp?: number
}

export class JwtAdapter {
	static generateToken(
		payload: Object,
		duration: string = envs.JWT_EXPIRE_IN,
	): Promise<string | null> {
		return new Promise((resolve) => {
			jwt.sign(
				payload,
				JWT_SEED,
				{ expiresIn: duration as any },
				(err, token) => {
					if (err) return resolve(null)
					resolve(token || null)
				},
			)
		})
	}

	static validateToken<T>(token: string): Promise<T | null> {
		return new Promise((resolve) => {
			jwt.verify(token, JWT_SEED, (err, decoded) => {
				if (err) return resolve(null)
				resolve(decoded as T)
			})
		})
	}
}
