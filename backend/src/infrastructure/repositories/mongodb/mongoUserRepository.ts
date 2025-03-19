import { UserRepository } from '../../../domain/repositories/userRepository.interface'
import {
	User as UserEntity,
	UserEntity as UserDomain,
} from '../../../domain/entities/user.entity'
import { User, IUser } from '../../../data/mongodb/models/user.model'
import mongoose from 'mongoose'

export class MongoUserRepository implements UserRepository {
	async create(user: UserDomain): Promise<UserEntity> {
		// Log the incoming user object to debug
		console.log('Creating user with data:', {
			...user,
			password: '[REDACTED]',
			defaultTimerPreset: user.defaultTimerPreset || 'not provided',
		})

		// Prepare data for MongoDB
		const userData: any = {
			name: user.name,
			email: user.email,
			password: user.password,
			preferredLanguage: user.preferredLanguage || 'en',
			theme: user.theme || 'light',
			googleId: user.googleId,
			picture: user.picture,
			createdAt: user.createdAt || new Date(),
			updatedAt: user.updatedAt || new Date(),
		}

		// Add defaultTimerPreset only if it exists
		if (user.defaultTimerPreset) {
			// If it's a string, convert it to ObjectId
			try {
				userData.defaultTimerPreset = new mongoose.Types.ObjectId(
					user.defaultTimerPreset,
				)
				console.log(
					'Converted defaultTimerPreset to ObjectId:',
					userData.defaultTimerPreset,
				)
			} catch (error) {
				console.error(
					'Failed to convert defaultTimerPreset to ObjectId:',
					error,
				)
				// Don't set the field if there's an error
			}
		}

		const newUser = await User.create(userData)
		console.log('User created successfully with _id:', newUser._id)
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
		userData: Partial<UserDomain>,
	): Promise<UserEntity | null> {
		// Log update operation for debugging
		console.log('Updating user with ID:', id, 'Data:', {
			...userData,
			password: userData.password ? '[REDACTED]' : undefined,
			defaultTimerPreset: userData.defaultTimerPreset || 'not changed',
		})

		// Prepare data for update
		const updateData: any = { ...userData, updatedAt: new Date() }

		// If there's a defaultTimerPreset, ensure it's an ObjectId
		if (userData.defaultTimerPreset !== undefined) {
			if (userData.defaultTimerPreset) {
				try {
					updateData.defaultTimerPreset = new mongoose.Types.ObjectId(
						userData.defaultTimerPreset,
					)
					console.log(
						'Converted defaultTimerPreset to ObjectId for update:',
						updateData.defaultTimerPreset,
					)
				} catch (error) {
					console.error(
						'Failed to convert defaultTimerPreset to ObjectId for update:',
						error,
					)
					delete updateData.defaultTimerPreset // Remove to avoid errors
				}
			} else {
				// If null or empty, set to null
				updateData.defaultTimerPreset = null
				console.log('Setting defaultTimerPreset to null')
			}
		}

		// Remove id if present (MongoDB uses _id)
		if ('id' in updateData) {
			delete updateData.id
		}

		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
		})

		if (updatedUser) {
			console.log(
				'User updated successfully. New defaultTimerPreset:',
				updatedUser.defaultTimerPreset
					? updatedUser.defaultTimerPreset.toString()
					: 'not set',
			)
		} else {
			console.log('User update failed. User not found with ID:', id)
		}

		return updatedUser ? this.mapToDomain(updatedUser) : null
	}

	async updatePassword(id: string, newPassword: string): Promise<boolean> {
		const user = await User.findById(id)
		if (!user) return false
		user.password = newPassword // The pre-save hook will hash the password
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

	private mapToDomain(user: mongoose.Document): UserEntity {
		// Need to cast user as unknown to access private fields
		const userDoc = user as unknown as {
			_id: mongoose.Types.ObjectId
			name: string
			email: string
			password: string
			preferredLanguage: string
			theme: string
			defaultTimerPreset?: mongoose.Types.ObjectId
			createdAt: Date
			updatedAt: Date
			googleId?: string
			picture?: string
			comparePassword: (password: string) => boolean
		}

		// Log the mapping process
		console.log('Mapping MongoDB user to domain:', {
			_id: userDoc._id.toString(),
			defaultTimerPreset: userDoc.defaultTimerPreset
				? userDoc.defaultTimerPreset.toString()
				: 'not set',
		})

		// Create the domain entity
		const mappedUser: UserEntity = {
			_id: userDoc._id.toString(),
			name: userDoc.name,
			email: userDoc.email,
			password: userDoc.password,
			preferredLanguage: userDoc.preferredLanguage as 'es' | 'en',
			theme: userDoc.theme as 'light' | 'dark',
			defaultTimerPreset: userDoc.defaultTimerPreset
				? userDoc.defaultTimerPreset.toString()
				: undefined,
			createdAt: userDoc.createdAt,
			updatedAt: userDoc.updatedAt,
			googleId: userDoc.googleId,
			picture: userDoc.picture,
			comparePassword: (password: string) =>
				userDoc.comparePassword(password),
		}

		return mappedUser
	}
}
