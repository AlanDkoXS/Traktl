import { UserRepository } from '../../../domain/repositories/userRepository.interface'
import {
    User as UserEntity,
    UserEntity as UserDomain,
} from '../../../domain/entities/user.entity'
import { User, IUser } from '../../../data/mongodb/models/user.model'
import mongoose from 'mongoose'

export class MongoUserRepository implements UserRepository {
    async create(user: UserDomain): Promise<UserEntity> {
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
        userData: Partial<UserDomain>
    ): Promise<UserEntity | null> {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { ...userData, updatedAt: new Date() },
            { new: true }
        )
        return updatedUser ? this.mapToDomain(updatedUser) : null
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
            preferredLanguage: user.preferredLanguage as 'es' | 'en',
            theme: user.theme as 'light' | 'dark',
            defaultTimerPreset: user.defaultTimerPreset?.toString(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            googleId: user.googleId,
            picture: user.picture,
            comparePassword: (password: string) => user.comparePassword(password)
        }
        return mappedUser
    }
}
