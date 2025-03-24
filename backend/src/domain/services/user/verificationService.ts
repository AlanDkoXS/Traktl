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

	/**
	 * Generates a verification token for the user
	 * Having a token means the user is verified
	 */
	async generateEmailVerificationToken(
		userId: string,
		email: string,
	): Promise<string> {
		// Generate verification token with no expiration
		const token = await JwtAdapter.generateToken(
			{ id: userId, email },
			'365d', // Very long expiration (essentially permanent)
		)

		if (!token) {
			throw CustomError.internalServer(
				'Error generating verification token',
			)
		}

		// Create token data without expiration
		const emailVerificationTokenData: EmailVerificationToken = {
			token,
			expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far future
		}

		// Update user with verification token
		const updated = await this.userRepository.update(userId, {
			emailVerificationToken: emailVerificationTokenData,
		} as any)

		if (!updated) {
			throw CustomError.internalServer('Error storing verification token')
		}

		return token
	}

	/**
	 * Requests a verification email to be sent to the user
	 */
	async requestVerification(userId: string, email: string): Promise<boolean> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		// If user already has a token, they're already verified
		if (user.emailVerificationToken?.token) {
			throw CustomError.badRequest('Email already verified')
		}

		const token = await this.generateEmailVerificationToken(userId, email)
		return this.emailService.sendVerificationEmail(email, token)
	}

	/**
	 * Verifies a user's email using a token
	 * Sets the token in the user record to mark them as verified
	 */
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

			// If user already has the token, they're already verified
			if (user.emailVerificationToken?.token === token) {
				return true
			}

			// Store the token to mark user as verified
			const emailVerificationTokenData: EmailVerificationToken = {
				token,
				expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far future
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

	/**
	 * Gets the verification status of a user
	 * A user is verified if they have a token
	 */
	async getVerificationStatus(
		userId: string,
	): Promise<{ isVerified: boolean }> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		return {
			isVerified: !!user.emailVerificationToken?.token,
		}
	}
}
