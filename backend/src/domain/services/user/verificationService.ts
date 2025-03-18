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
		// Generate verification token (24 hours expiration)
		const token = await JwtAdapter.generateToken(
			{ id: userId, email },
			'24h',
		)

		if (!token) {
			throw CustomError.internalServer(
				'Error generating verification token',
			)
		}

		// Update user with verification token
		const expiresAt = new Date()
		expiresAt.setHours(expiresAt.getHours() + 24)

		const emailVerificationTokenData: EmailVerificationToken = {
			token,
			expiresAt,
		}

		const updated = await this.userRepository.update(userId, {
			emailVerificationToken: emailVerificationTokenData,
		} as any)

		if (!updated) {
			throw CustomError.internalServer('Error storing verification token')
		}

		return token
	}

	async requestVerification(userId: string, email: string): Promise<boolean> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		if (user.isVerified) {
			throw CustomError.badRequest('Email already verified')
		}

		const token = await this.generateEmailVerificationToken(userId, email)

		return this.emailService.sendVerificationEmail(email, token)
	}

	async verifyEmail(token: string): Promise<boolean> {
		try {
			const payload = (await JwtAdapter.validateToken(
				token,
			)) as TokenPayload

			if (!payload || !payload.id) {
				throw CustomError.unauthorized('Invalid or expired token')
			}

			const userId = payload.id

			const user = await this.userRepository.findById(userId)
			if (!user) {
				throw CustomError.notFound('User not found')
			}

			if (user.isVerified) {
				return true
			}

			const updated = await this.userRepository.update(userId, {
				isVerified: true,
				emailVerificationToken: undefined,
			} as any)

			if (!updated) {
				throw CustomError.internalServer(
					'Error updating verification status',
				)
			}

			return true
		} catch (error) {
			console.error('Verification error:', error)
			throw CustomError.unauthorized('Invalid or expired token')
		}
	}

	async getVerificationStatus(
		userId: string,
	): Promise<{ isVerified: boolean }> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		return { isVerified: user.isVerified || false }
	}
}
