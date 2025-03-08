import { UserRepository } from '../../repositories/userRepository.interface'
import { User, UserEntity } from '../../entities/user.entity'
import { CreateUserDTO } from '../../dtos/user/create-user.dto'
import { LoginUserDTO } from '../../dtos/user/login-user.dto'
import { UpdateUserDTO } from '../../dtos/user/update-user.dto'
import { CustomError } from '../../errors/custom.errors'
import { JwtAdapter } from '../../../config/jwt.adapter'
import { regularExp } from '../../../config/regular-exp'

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async registerUser(
        createUserDto: CreateUserDTO
    ): Promise<{ user: User; token: string }> {
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

        // Create user
        const user = await this.userRepository.create(userEntity)

        // Generate JWT token
        const token = await JwtAdapter.generateToken({ id: user._id })
        if (!token) throw CustomError.internalServer('Error generating token')

        return { user, token }
    }

    async loginUser(
        loginUserDto: LoginUserDTO
    ): Promise<{ user: User; token: string }> {
        const { email, password } = loginUserDto
        console.log('Login attempt:', email);

        // Find user by email
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            console.log('User not found:', email);
            throw CustomError.unauthorized('Invalid credentials')
        }

        console.log('User found:', user.email);
        console.log('Stored hashed password:', user.password);
        console.log('Provided password:', password);

        // Check if comparePassword method exists
        if (!user.comparePassword) {
            console.error('comparePassword method does not exist on user object');
            throw CustomError.internalServer('Authentication system error');
        }

        // Validate password
        const isPasswordValid = user.comparePassword(password);
        console.log('Password validation result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
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
        updateUserDto: UpdateUserDTO
    ): Promise<User> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw CustomError.notFound('User not found')
        }

        const updatedUser = await this.userRepository.update(
            userId,
            updateUserDto
        )
        if (!updatedUser) {
            throw CustomError.internalServer('Error updating user')
        }

        return updatedUser
    }
}
