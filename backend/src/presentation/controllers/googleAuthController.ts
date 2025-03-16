import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { GoogleAuthService } from '../../domain/services/auth/googleAuthService';
import { UserService } from '../../domain/services/user/userService';
import { z } from 'zod';

const GoogleTokenSchema = z.object({
    token: z.string().min(1, { message: 'Google token is required' }),
});

export class GoogleAuthController extends BaseController {
    private googleAuthService: GoogleAuthService;

    constructor(userService: UserService) {
        super();
        this.googleAuthService = new GoogleAuthService(userService);
    }

    public googleLogin = async (req: Request, res: Response) => {
        try {
            console.log('Google login request received');
            
            // Log the request body (be careful not to log sensitive data in production)
            console.log('Request body:', {
                hasToken: !!req.body.token,
                tokenLength: req.body.token ? req.body.token.length : 0
            });
            
            const validationResult = GoogleTokenSchema.safeParse(req.body);
            
            if (!validationResult.success) {
                console.error('Token validation failed:', validationResult.error.errors);
                return res.status(400).json({
                    ok: false,
                    error: validationResult.error.errors.map(err => `${err.path}: ${err.message}`).join(', ')
                });
            }

            const { token } = validationResult.data;
            console.log('Token validated, proceeding with Google login');
            
            const result = await this.googleAuthService.loginWithGoogle(token);
            
            console.log('Google login successful, returning result');
            return this.handleSuccess(res, result);
        } catch (error) {
            console.error('Google login controller error:', error);
            return this.handleError(error, res);
        }
    };
}
