import { UserRepository } from '../../repositories/userRepository.interface'
import { User, UserEntity } from '../../entities/user.entity'
import { CreateUserDTO } from '../../dtos/user/create-user.dto'
import { LoginUserDTO } from '../../dtos/user/login-user.dto'
import { UpdateUserDTO } from '../../dtos/user/update-user.dto'
import { CustomError } from '../../errors/custom.errors'
import { JwtAdapter } from '../../../config/jwt.adapter'
import { regularExp } from '../../../config/regular-exp'
import { ProjectRepository } from '../../repositories/projectRepository.interface'
import { TimerPresetRepository } from '../../repositories/timerPresetRepository.interface'

export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly projectRepository: ProjectRepository,
		private readonly timerPresetRepository: TimerPresetRepository,
		private readonly emailService?: any,
	) {
		console.log('UserService constructor called')
		console.log('UserRepository initialized:', !!this.userRepository)
	}

	async registerUser(
		createUserDto: CreateUserDTO,
	): Promise<{ user: User; token: string }> {
		try {
			const { email, password } = createUserDto

			if (!regularExp.email.test(email)) {
				throw CustomError.badRequest('Invalid email format')
			}

			const existingUser = await this.userRepository.findByEmail(email)
			if (existingUser) {
				throw CustomError.badRequest('User already exists')
			}

			const userEntity: UserEntity = {
				name: createUserDto.name,
				email: createUserDto.email,
				password: createUserDto.password,
				preferredLanguage: createUserDto.preferredLanguage || 'en',
				theme: createUserDto.theme || 'light',
				googleId: createUserDto.googleId,
				picture: createUserDto.picture,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			const user = await this.userRepository.create(userEntity)

			try {
				console.log(
					'Starting initialization of default settings for user:',
					user.email,
				)

				if (!user._id) {
					console.error(
						'User creation succeeded but _id is missing:',
						user,
					)
					throw new Error('User ID is missing after creation')
				}

				const userEntityForInit: User = {
					...user,
					_id: user._id,
				}

				const updatedUser = await this.userRepository.findById(user._id)
				if (updatedUser) {
					Object.assign(user, updatedUser)
				}
			} catch (initError) {
				console.error('Error during user initialization:', initError)
				console.error(
					'Will continue with registration despite initialization failure',
				)
			}

			console.log('Generating authentication token...')
			const token = await JwtAdapter.generateToken({ id: user._id })
			if (!token) {
				throw CustomError.internalServer('Error generating token')
			}

			console.log('User registration completed successfully')
			return { user, token }
		} catch (error) {
			console.error('Error during user registration:', error)
			throw error
		}
	}

	async loginUser(
		loginUserDto: LoginUserDTO,
	): Promise<{ user: User; token: string }> {
		const { email, password } = loginUserDto
		console.log('Login attempt:', email)

		const user = await this.userRepository.findByEmail(email)
		if (!user) {
			console.log('User not found:', email)
			throw CustomError.unauthorized('Invalid credentials')
		}

		if (user.isActive === false) {
			console.log('User account is deactivated:', email)
			throw CustomError.unauthorized('Invalid credentials')
		}

		if (!user.comparePassword) {
			console.error(
				'comparePassword method does not exist on user object',
			)
			throw CustomError.internalServer('Authentication system error')
		}

		const isPasswordValid = user.comparePassword(password)
		console.log('Password validation result:', isPasswordValid)
		if (!isPasswordValid) {
			console.log('Invalid password for user:', email)
			throw CustomError.unauthorized('Invalid credentials')
		}

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
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		if (!user.comparePassword) {
			throw CustomError.internalServer('Authentication system error')
		}

		const isPasswordValid = user.comparePassword(currentPassword)
		if (!isPasswordValid) {
			throw CustomError.badRequest('Current password is incorrect')
		}

		const updated = await this.userRepository.updatePassword(
			userId,
			newPassword,
		)
		if (!updated) {
			throw CustomError.internalServer('Error updating password')
		}

		return true
	}

	async forgotPassword(
		email: string,
		language: string = 'en',
	): Promise<boolean> {
		const user = await this.userRepository.findByEmail(email)
		if (!user) {
			return true
		}

		const token = await JwtAdapter.generateToken({ id: user._id }, '1h')
		if (!token) {
			throw CustomError.internalServer('Error generating token')
		}

		if (this.emailService) {
			try {
				await this.emailService.sendPasswordResetEmail(
					email,
					token,
					language,
				)
			} catch (error) {
				console.error('Error sending password reset email:', error)
			}
		} else {
			console.log(`Password reset token for ${email}: ${token}`)
		}

		return true
	}

	async resetPassword(token: string, newPassword: string): Promise<boolean> {
		const payload = await JwtAdapter.validateToken<{ id: string }>(token)
		if (!payload || !payload.id) {
			throw CustomError.unauthorized('Invalid or expired token')
		}

		const userId = payload.id
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		const updated = await this.userRepository.updatePassword(
			userId,
			newPassword,
		)
		if (!updated) {
			throw CustomError.internalServer('Error updating password')
		}

		return true
	}

	async deleteUser(userId: string): Promise<boolean> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			throw CustomError.notFound('User not found')
		}

		const updateData = {
			$set: {
				isActive: false,
				deletedAt: new Date(),
				defaultTimerPreset: undefined,
				preferredLanguage: 'en' as const,
				theme: 'light' as const,
			},
			$unset: {
				emailVerificationToken: 1,
			},
		}

		const updated = await this.userRepository.update(userId, updateData)

		if (!updated) {
			throw CustomError.internalServer('Error inactivating user')
		}

		try {
			await this.projectRepository.deleteAllByUserId(userId)
			await this.timerPresetRepository.deleteAllByUserId(userId)
		} catch (error) {
			console.error('Error deleting user data:', error)
		}

		return true
	}
}
