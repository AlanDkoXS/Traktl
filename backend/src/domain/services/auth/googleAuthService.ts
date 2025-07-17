import { OAuth2Client } from 'google-auth-library'
import { envs } from '../../../config'
import { UserService } from '../user/userService'
import { CreateUserDTO } from '../../dtos/user/create-user.dto'
import { UserRepository } from '../../repositories/userRepository.interface'
import { CustomError } from '../../errors/custom.errors'
import { JwtAdapter } from '../../../config/jwt.adapter'
import { User } from '../../entities/user.entity'

export class GoogleAuthService {
	private googleClient: OAuth2Client

	constructor(private readonly userService: UserService) {
		this.googleClient = new OAuth2Client(
			envs.GOOGLE_CLIENT_ID,
			envs.GOOGLE_CLIENT_SECRET,
		)
	}

	async verifyGoogleToken(idToken: string) {
		try {
			const ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: envs.GOOGLE_CLIENT_ID,
			})

			const payload = ticket.getPayload()

			if (!payload) {
				throw CustomError.badRequest('Invalid Google token')
			}

			return payload
		} catch (error) {
			throw CustomError.badRequest(
				'Invalid Google token: ' +
					(error instanceof Error ? error.message : 'Unknown error'),
			)
		}
	}

	async loginWithGoogle(idToken: string) {
		try {
			const googleUserInfo = await this.verifyGoogleToken(idToken)

			if (!googleUserInfo.email) {
				throw CustomError.badRequest(
					'Email not found in Google account',
				)
			}

			const userRepository = this.userService[
				'userRepository'
			] as UserRepository
			let user = await userRepository.findByCriteria({
				googleId: googleUserInfo.sub,
			})
			let userEntity: User | null = null

			if (user.length === 0) {
				const existingUser = await userRepository.findByEmail(
					googleUserInfo.email,
				)

				if (existingUser) {
					userEntity = await userRepository.update(existingUser._id, {
						googleId: googleUserInfo.sub,
						picture: googleUserInfo.picture,
					})

					if (!userEntity) {
						throw CustomError.internalServer(
							'Error updating user with Google ID',
						)
					}
				} else {
					const createUserDto = new CreateUserDTO(
						googleUserInfo.name || 'Google User',
						googleUserInfo.email,
						Math.random().toString(36).slice(-16),
						'en',
						'light',
						undefined,
						googleUserInfo.picture,
					)

					const { user: newUser } =
						await this.userService.registerUser(createUserDto)
					userEntity = newUser
				}
			} else {
				userEntity = user[0]
			}

			const authToken = await JwtAdapter.generateToken({
				id: userEntity._id,
			})

			if (!authToken) {
				throw CustomError.internalServer('Error generating token')
			}

			return {
				user: userEntity,
				token: authToken,
			}
		} catch (error) {
			throw error
		}
	}
}