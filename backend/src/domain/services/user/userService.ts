import { UserRepository } from '../../repositories/userRepository.interface'
import { User, UserEntity } from '../../entities/user.entity'
import { CreateUserDTO } from '../../dtos/user/create-user.dto'
import { LoginUserDTO } from '../../dtos/user/login-user.dto'
import { UpdateUserDTO } from '../../dtos/user/update-user.dto'
import { CustomError } from '../../errors/custom.errors'
import { JwtAdapter } from '../../../config/jwt.adapter'
import { regularExp } from '../../../config/regular-exp'
import { UserInitService } from './userInitService'
import { EmailService } from '../../../service/emailService'

export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly userInitService: UserInitService,
		private readonly emailService: EmailService = new EmailService(),
	) {
		console.log('UserService constructor called')
		console.log('UserRepository initialized:', !!this.userRepository)
		console.log('UserInitService initialized:', !!this.userInitService)
		console.log('EmailService initialized:', !!this.emailService)
	}

	async registerUser(
		createUserDto: CreateUserDTO,
	): Promise<{ user: User; token: string }> {
		try {
			console.log(
				'Starting user registration process for:',
				createUserDto.email,
			)
			const { email, password } = createUserDto
			// Validate email format
			if (!regularExp.email.test(email)) {
				throw CustomError.badRequest('Invalid email format')
			}
			// Check if user already exists
			const existingUser = await this.userRepository.findByEmail(email)
			if (existingUser) {
				throw CustomError.badRequest('User already exists')
			}
			// Convert DTO to UserEntity
			const userEntity: UserEntity = {
				name: createUserDto.name,
				email: createUserDto.email,
				password: createUserDto.password,
				preferredLanguage: createUserDto.preferredLanguage || 'en',
				theme: createUserDto.theme || 'light',
				defaultTimerPreset: createUserDto.defaultTimerPreset,
				googleId: createUserDto.googleId,
				picture: createUserDto.picture,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			console.log('Creating user in database...')
			// Create user
			const user = await this.userRepository.create(userEntity)
			console.log('User created successfully with ID:', user._id)

			// Initialize user with default settings - with more robust error handling
			try {
				console.log(
					'Starting initialization of default settings for user:',
					user.email,
				)

				// MongoDB uses _id, make sure we pass the correct ID to the initialization service
				if (!user._id) {
					console.error(
						'User creation succeeded but _id is missing:',
						user,
					)
					throw new Error('User ID is missing after creation')
				}

				// Wait for initialization to complete
				await this.userInitService.initializeUser(user)
				console.log('User initialization completed successfully')
			} catch (initError) {
				// Log error but don't fail the registration
				console.error('Error during user initialization:', initError)
				console.error(
					'Will continue with registration despite initialization failure',
				)

				// We could consider deleting the user if initialization completely fails
				// await this.userRepository.delete(user._id);
				// throw CustomError.internalServer('Error setting up user account');
			}

			// Generate JWT token
			console.log('Generating authentication token...')
			const token = await JwtAdapter.generateToken({ id: user._id })
			if (!token) {
				throw CustomError.internalServer('Error generating token')
			}

			console.log('User registration completed successfully')
			return { user, token }
		} catch (error) {
			console.error('Error during user registration:', error)
			// Re-throw the error to be handled by the controller
			throw error
		}
	}

	async loginUser(
		loginUserDto: LoginUserDTO,
	): Promise<{ user: User; token: string }> {
		const { email, password } = loginUserDto
		console.log('Login attempt:', email)
		// Find user by email
		const user = await this.userRepository.findByEmail(email)
		if (!user) {
			console.log('User not found:', email)
			throw CustomError.unauthorized('Invalid credentials')
		}
		console.log('User found:', user.email)
		console.log('Stored hashed password:', user.password)
		console.log('Provided password:', password)
		//TODO: Ocultar password
		// Check if comparePassword method exists
		if (!user.comparePassword) {
			console.error(
				'comparePassword method does not exist on user object',
			)
			throw CustomError.internalServer('Authentication system error')
		}
		// Validate password
		const isPasswordValid = user.comparePassword(password)
		console.log('Password validation result:', isPasswordValid)
		if (!isPasswordValid) {
			console.log('Invalid password for user:', email)
			throw CustomError.unauthorized('Invalid credentials')
		}
		// Generate JWT token
		const token = await JwtAdapter.generateToken({ id: user._id })
		if (!token) throw CustomError.internalServer('Error generating token')
		return { user, token }
	}

	async getUserById(userId: string): Promise<User> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}
		return user
	}

	async getProfile(userId: string): Promise<User> {
		return this.getUserById(userId)
	}

	async updateUser(
		userId: string,
		updateUserDto: UpdateUserDTO,
	): Promise<User> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}
		const updatedUser = await this.userRepository.update(
			userId,
			updateUserDto,
		)
		if (!updatedUser) {
			throw CustomError.internalServer('Error updating user')
		}
		return updatedUser
	}

	async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string,
	): Promise<boolean> {
		// Find user by ID
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		// Validate current password
		if (!user.comparePassword) {
			throw CustomError.internalServer('Authentication system error')
		}

		const isPasswordValid = user.comparePassword(currentPassword)
		if (!isPasswordValid) {
			throw CustomError.badRequest('Current password is incorrect')
		}

		// Update password
		const updated = await this.userRepository.updatePassword(
			userId,
			newPassword,
		)
		if (!updated) {
			throw CustomError.internalServer('Error updating password')
		}

		return true
	}

	async forgotPassword(email: string): Promise<boolean> {
		// Find user by email
		const user = await this.userRepository.findByEmail(email)
		if (!user) {
			// For security reasons, don't reveal if the email exists or not
			// Still return true so the client doesn't know if the email exists
			console.log(
				`Password reset requested for non-existent email: ${email}`,
			)
			return true
		}

		// Generate password reset token (token expires in 1 hour)
		const token = await JwtAdapter.generateToken({ id: user._id }, '1h')
		if (!token) {
			throw CustomError.internalServer('Error generating token')
		}

		try {
			// Send password reset email
			console.log(
				`Sending password reset email to ${email} with token: ${token}`,
			)
			await this.emailService.sendPasswordResetEmail(email, token)
			console.log(`Password reset email sent successfully to ${email}`)
		} catch (error) {
			console.error(
				`Error sending password reset email to ${email}:`,
				error,
			)
			// If in development environment, log the token for testing
			if (process.env.NODE_ENV === 'development') {
				console.log(
					`Password reset token for ${email} (for testing): ${token}`,
				)
			}
			// Don't throw the error to maintain security (don't reveal if email exists)
		}

		return true
	}

	async resetPassword(token: string, newPassword: string): Promise<boolean> {
		// Verify token
		const payload = await JwtAdapter.validateToken<{ id: string }>(token)
		if (!payload || !payload.id) {
			throw CustomError.unauthorized('Invalid or expired token')
		}

		// Find user by ID
		const userId = payload.id
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		// Update password
		const updated = await this.userRepository.updatePassword(
			userId,
			newPassword,
		)
		if (!updated) {
			throw CustomError.internalServer('Error updating password')
		}

		return true
	}
}
