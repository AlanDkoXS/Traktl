import { UserRepository } from '../../repositories/userRepository.interface'
import { EmailService } from '../../../service/emailService'
import { JwtAdapter } from '../../../config/jwt.adapter'
import { CustomError } from '../../errors/custom.errors'
import { EmailVerificationToken } from '../../entities/user.entity'

interface TokenPayload {
	id: string
	email?: string
	[key: string]: any
}

export class VerificationService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
	) {}

	async generateEmailVerificationToken(
		userId: string,
		email: string,
	): Promise<string> {
		const token = await JwtAdapter.generateToken(
			{ id: userId, email },
			'24h',
		)

		if (!token) {
			throw CustomError.internalServer(
				'Error generating verification token',
			)
		}

		return token
	}

	async requestVerification(
		userId: string,
		email: string,
		language: string = 'en',
	): Promise<boolean> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		if (user.emailVerificationToken?.token) {
			throw CustomError.badRequest('Email already verified')
		}

		const token = await this.generateEmailVerificationToken(userId, email)
		return this.emailService.sendVerificationEmail(email, token, language)
	}

	async verifyEmail(token: string): Promise<boolean> {
		try {
			const payload = (await JwtAdapter.validateToken(
				token,
			)) as TokenPayload
			if (!payload || !payload.id) {
				throw CustomError.unauthorized('Invalid token')
			}

			const userId = payload.id
			const user = await this.userRepository.findById(userId)
			if (!user) {
				throw CustomError.notFound('User not found')
			}

			if (user.emailVerificationToken?.token === token) {
				return true
			}

			const emailVerificationTokenData: EmailVerificationToken = {
				token,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			}

			const updated = await this.userRepository.update(userId, {
				emailVerificationToken: emailVerificationTokenData,
			} as any)

			if (!updated) {
				throw CustomError.internalServer(
					'Error updating verification status',
				)
			}

			return true
		} catch (error) {
			console.error('Verification error:', error)
			throw CustomError.unauthorized('Invalid token')
		}
	}

	async getVerificationStatus(userId: string): Promise<{
		isVerified: boolean
		emailVerificationToken?: EmailVerificationToken
	}> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		const isVerified =
			!!user.emailVerificationToken?.token &&
			new Date(user.emailVerificationToken.expiresAt) > new Date()

		return {
			isVerified,
			emailVerificationToken: user.emailVerificationToken,
		}
	}
}
