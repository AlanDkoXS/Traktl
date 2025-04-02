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
		// Generate verification token with 24 hours expiration
		const token = await JwtAdapter.generateToken(
			{ id: userId, email },
			'24h',
		)

		if (!token) {
			throw CustomError.internalServer(
				'Error generating verification token',
			)
		}

		// Create token data with 24 hours expiration
		const emailVerificationTokenData: EmailVerificationToken = {
			token,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		}

		// Update user with last verification request only
		const updated = await this.userRepository.update(userId, {
			lastVerificationRequest: new Date(),
		} as any)

		if (!updated) {
			throw CustomError.internalServer('Error storing verification request')
		}

		return token
	}

	/**
	 * Requests a verification email to be sent to the user
	 */
	async requestVerification(
		userId: string,
		email: string,
		language: string = 'en'
	): Promise<boolean> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		// Check if user is already verified
		if (user.emailVerificationToken?.token) {
			throw CustomError.badRequest('Email already verified')
		}

		// Check cooldown period (1 minute)
		if (user.lastVerificationRequest) {
			const lastRequest = new Date(user.lastVerificationRequest)
			const now = new Date()
			const diffInMinutes = (now.getTime() - lastRequest.getTime()) / (1000 * 60)

			if (diffInMinutes < 1) {
				throw CustomError.badRequest('Please wait 1 minute before requesting another verification email')
			}
		}

		const token = await this.generateEmailVerificationToken(userId, email)
		return this.emailService.sendVerificationEmail(email, token, language)
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
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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
	 * A user is verified if they have a valid token
	 */
	async getVerificationStatus(
		userId: string,
	): Promise<{ isVerified: boolean, emailVerificationToken?: EmailVerificationToken }> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		// Check if token exists and is not expired
		const isVerified = !!user.emailVerificationToken?.token &&
			new Date(user.emailVerificationToken.expiresAt) > new Date()

		return {
			isVerified,
			emailVerificationToken: user.emailVerificationToken
		}
	}
}
