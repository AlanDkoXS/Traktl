import { User, UserEntity } from '../entities/user.entity'

type MongoUpdateOperators = {
	$set?: Partial<UserEntity>
	$unset?: { [key: string]: number }
}

export interface UserRepository {
	create(user: UserEntity): Promise<User>
	findById(id: string): Promise<User | null>
	findByEmail(email: string): Promise<User | null>
	update(id: string, user: Partial<UserEntity> | MongoUpdateOperators): Promise<User | null>
	updatePassword(id: string, newPassword: string): Promise<boolean>
	delete(id: string): Promise<boolean>
	list(page?: number, limit?: number): Promise<User[]>
	findByCriteria(criteria: Partial<UserEntity>): Promise<User[]>
}
