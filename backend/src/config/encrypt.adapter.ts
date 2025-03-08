import { genSaltSync, hashSync, compareSync } from 'bcryptjs'

export const encryptAdapter = {
    hash: (password: string) => {
        const salt = genSaltSync(10); // Reduced from 12 to 10 for consistency
        return hashSync(password, salt)
    },

    compare: (plainPassword: string, hashedPassword: string) => {
        try {
            console.log('Comparing passwords:');
            console.log('- Plain password length:', plainPassword.length);
            console.log('- Hashed password length:', hashedPassword.length);
            const result = compareSync(plainPassword, hashedPassword);
            console.log('- Comparison result:', result);
            return result;
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return false;
        }
    },
}
