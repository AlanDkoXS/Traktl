import { OAuth2Client } from 'google-auth-library';
import { envs } from '../../../config';
import { UserService } from '../user/userService';
import { CreateUserDTO } from '../../dtos/user/create-user.dto';
import { UserRepository } from '../../repositories/userRepository.interface';
import { CustomError } from '../../errors/custom.errors';
import { JwtAdapter } from '../../../config/jwt.adapter';
import { User } from '../../entities/user.entity';

export class GoogleAuthService {
    private googleClient: OAuth2Client;

    constructor(private readonly userService: UserService) {
        this.googleClient = new OAuth2Client(
            envs.GOOGLE_CLIENT_ID,
            envs.GOOGLE_CLIENT_SECRET
        );
    }

    async verifyGoogleToken(idToken: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: envs.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            
            if (!payload) {
                throw CustomError.badRequest('Invalid Google token');
            }

            return payload;
        } catch (error) {
            console.error('Error verifying Google token:', error);
            throw CustomError.badRequest('Invalid Google token');
        }
    }

    async loginWithGoogle(idToken: string) {
        // Verify the Google token
        const googleUserInfo = await this.verifyGoogleToken(idToken);

        if (!googleUserInfo.email) {
            throw CustomError.badRequest('Email not found in Google account');
        }

        // Find if user exists by Google ID or email
        const userRepository = this.userService['userRepository'] as UserRepository;
        let user = await userRepository.findByCriteria({ googleId: googleUserInfo.sub });
        let userEntity: User | null = null;

        if (user.length === 0) {
            // Check if user exists with same email
            const existingUser = await userRepository.findByEmail(googleUserInfo.email);

            if (existingUser) {
                // Update existing user with Google ID
                userEntity = await userRepository.update(existingUser._id, {
                    googleId: googleUserInfo.sub,
                    picture: googleUserInfo.picture
                });
                
                if (!userEntity) {
                    throw CustomError.internalServer('Error updating user with Google ID');
                }
            } else {
                // Create new user
                const createUserDto = new CreateUserDTO(
                    googleUserInfo.name || 'Google User',
                    googleUserInfo.email,
                    Math.random().toString(36).slice(-16), // Random password
                    'en',
                    'light',
                    undefined,
                    googleUserInfo.sub,
                    googleUserInfo.picture
                );

                const { user: newUser } = await this.userService.registerUser(createUserDto);
                userEntity = newUser;
            }
        } else {
            userEntity = user[0];
        }

        // Generate JWT token
        const authToken = await JwtAdapter.generateToken({ id: userEntity._id });
        if (!authToken) throw CustomError.internalServer('Error generating token');

        return { 
            user: userEntity, 
            token: authToken 
        };
    }
}
