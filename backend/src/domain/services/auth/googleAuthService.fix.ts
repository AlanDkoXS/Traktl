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
        console.log('Initializing GoogleAuthService...');
        console.log('GOOGLE_CLIENT_ID:', envs.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing');
        console.log('GOOGLE_CLIENT_SECRET:', envs.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing');
        
        this.googleClient = new OAuth2Client(
            envs.GOOGLE_CLIENT_ID,
            envs.GOOGLE_CLIENT_SECRET
        );
    }

    async verifyGoogleToken(idToken: string) {
        try {
            console.log('Verifying Google token...');
            console.log('Token length:', idToken.length);
            
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: envs.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            
            if (!payload) {
                console.error('Payload is null after verification');
                throw CustomError.badRequest('Invalid Google token');
            }

            console.log('Token verified successfully');
            console.log('User email:', payload.email);
            console.log('User name:', payload.name);
            
            return payload;
        } catch (error) {
            console.error('Error verifying Google token:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            throw CustomError.badRequest('Invalid Google token: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    async loginWithGoogle(idToken: string) {
        try {
            console.log('Login with Google initiated...');
            
            // Verify the Google token
            const googleUserInfo = await this.verifyGoogleToken(idToken);

            if (!googleUserInfo.email) {
                console.error('Email not found in Google account');
                throw CustomError.badRequest('Email not found in Google account');
            }

            console.log('Looking for existing user with Google ID:', googleUserInfo.sub);
            
            // Find if user exists by Google ID or email
            const userRepository = this.userService['userRepository'] as UserRepository;
            let user = await userRepository.findByCriteria({ googleId: googleUserInfo.sub });
            let userEntity: User | null = null;

            if (user.length === 0) {
                console.log('No user found with Google ID, checking email:', googleUserInfo.email);
                
                // Check if user exists with same email
                const existingUser = await userRepository.findByEmail(googleUserInfo.email);

                if (existingUser) {
                    console.log('User found with matching email, updating with Google ID');
                    
                    // Update existing user with Google ID
                    userEntity = await userRepository.update(existingUser._id, {
                        googleId: googleUserInfo.sub,
                        picture: googleUserInfo.picture
                    });
                    
                    if (!userEntity) {
                        console.error('Failed to update user with Google ID');
                        throw CustomError.internalServer('Error updating user with Google ID');
                    }
                } else {
                    console.log('No existing user found, creating new user');
                    
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
                    console.log('New user created with ID:', newUser._id);
                }
            } else {
                console.log('Existing user found with Google ID');
                userEntity = user[0];
            }

            // Generate JWT token
            console.log('Generating JWT token for user ID:', userEntity._id);
            const authToken = await JwtAdapter.generateToken({ id: userEntity._id });
            
            if (!authToken) {
                console.error('Failed to generate JWT token');
                throw CustomError.internalServer('Error generating token');
            }

            console.log('Authentication successful, returning user and token');
            return { 
                user: userEntity, 
                token: authToken 
            };
        } catch (error) {
            console.error('Google login process failed:', error);
            throw error; // Re-throw to be handled by the controller
        }
    }
}
