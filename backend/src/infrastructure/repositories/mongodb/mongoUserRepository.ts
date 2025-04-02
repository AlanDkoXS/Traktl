import { UserRepository } from '../../../domain/repositories/userRepository.interface'
import {
	User as UserEntity,
	UserEntity as UserDomain,
} from '../../../domain/entities/user.entity'
import { User, IUser } from '../../../data/mongodb/models/user.model'
import mongoose from 'mongoose'

export class MongoUserRepository implements UserRepository {
	async create(user: UserDomain): Promise<UserEntity> {
		console.log('Creating user with data:', {
			...user,
			password: '[REDACTED]',
		})
		const newUser = await User.create(user)
		return this.mapToDomain(newUser)
	}

	async findById(id: string): Promise<UserEntity | null> {
		const user = await User.findById(id)
		return user ? this.mapToDomain(user) : null
	}

	async findByEmail(email: string): Promise<UserEntity | null> {
		const user = await User.findOne({ email })
		return user ? this.mapToDomain(user) : null
	}

	async update(
		id: string,
		userData: Partial<UserDomain> | { $set: Partial<UserDomain>; $unset: { [key: string]: number } },
	): Promise<UserEntity | null> {
		console.log('Updating user with ID:', id, 'Data:', {
			...(userData as Partial<UserDomain>),
			password: (userData as Partial<UserDomain>).password ? '[REDACTED]' : undefined,
		})
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ ...userData, updatedAt: new Date() },
			{ new: true },
		)
		return updatedUser ? this.mapToDomain(updatedUser) : null
	}

	async updatePassword(id: string, newPassword: string): Promise<boolean> {
		const user = await User.findById(id)
		if (!user) return false
		user.password = newPassword
		user.updatedAt = new Date()
		await user.save()
		return true
	}

	async delete(id: string): Promise<boolean> {
		const result = await User.findByIdAndDelete(id)
		return !!result
	}

	async list(page: number = 1, limit: number = 10): Promise<UserEntity[]> {
		const skip = (page - 1) * limit
		const users = await User.find().skip(skip).limit(limit)
		return users.map((user) => this.mapToDomain(user))
	}

	async findByCriteria(criteria: Partial<UserDomain>): Promise<UserEntity[]> {
		const users = await User.find(criteria)
		return users.map((user) => this.mapToDomain(user))
	}

	private mapToDomain(user: any): UserEntity {
		const mappedUser: UserEntity = {
			_id: user._id.toString(),
			name: user.name,
			email: user.email,
			password: user.password,
			preferredLanguage: user.preferredLanguage as 'es' | 'en' | 'tr',
			theme: user.theme as 'light' | 'dark',
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			googleId: user.googleId,
			picture: user.picture,
			emailVerificationToken: user.emailVerificationToken,
			isVerified: user.isVerified || !!user.emailVerificationToken?.token,
			comparePassword: (password: string) =>
				user.comparePassword(password),
		}
		return mappedUser
	}
}
