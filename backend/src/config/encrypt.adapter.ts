import { genSaltSync, hashSync, compareSync } from 'bcryptjs'

export const encryptAdapter = {
	hash: (password: string) => {
		const salt = genSaltSync(10)
		return hashSync(password, salt)
	},

	compare: (plainPassword: string, hashedPassword: string) => {
		try {
			return compareSync(plainPassword, hashedPassword)
		} catch (error) {
			console.error('Error comparing passwords:', error)
			return false
		}
	},
}