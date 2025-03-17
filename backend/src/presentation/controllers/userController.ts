import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { UserService } from '../../domain/services/user/userService'
import { VerificationService } from '../../domain/services/user/verificationService'
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../../domain/dtos'
import { ChangePasswordDTO } from '../../domain/dtos/change-password.dto'
import '../../domain/types/request-extension'

export class UserController extends BaseController {
    constructor(
        private readonly userService: UserService,
        private readonly verificationService: VerificationService
    ) {
        super()
    }

    public register = async (req: Request, res: Response) => {
        try {
            const [error, createUserDto] = CreateUserDTO.create(req.body)
            if (error) return res.status(400).json({ error })
            const result = await this.userService.registerUser(createUserDto!)
            return this.handleSuccess(res, result, 201)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public login = async (req: Request, res: Response) => {
        try {
            const [error, loginUserDto] = LoginUserDTO.create(req.body)
            if (error) return res.status(400).json({ error })
            const result = await this.userService.loginUser(loginUserDto!)
            return this.handleSuccess(res, result)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public getProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })
            const user = await this.userService.getUserById(userId)
            return this.handleSuccess(res, user)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })
            const [error, updateUserDto] = UpdateUserDTO.create(req.body)
            if (error) return res.status(400).json({ error })
            const updatedUser = await this.userService.updateUser(
                userId,
                updateUserDto!
            )
            return this.handleSuccess(res, updatedUser)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public changePassword = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })
            
            const [error, changePasswordDto] = ChangePasswordDTO.create(req.body)
            if (error) return res.status(400).json({ error })
            
            const result = await this.userService.changePassword(
                userId,
                changePasswordDto!.currentPassword,
                changePasswordDto!.newPassword
            )
            
            return this.handleSuccess(res, { message: 'Password updated successfully' })
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    // Email verification methods
    public requestVerification = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })
            
            // Get user to retrieve email
            const user = await this.userService.getUserById(userId)
            if (!user || !user.email) {
                return res.status(400).json({ error: 'User email not found' })
            }
            
            await this.verificationService.requestVerification(userId, user.email)
            
            return this.handleSuccess(res, { 
                message: 'Verification email sent successfully' 
            })
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public verifyEmail = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            if (!token) return res.status(400).json({ error: 'Token is required' })
            
            await this.verificationService.verifyEmail(token)
            
            return this.handleSuccess(res, { 
                message: 'Email verified successfully' 
            })
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public getVerificationStatus = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })
            
            const status = await this.verificationService.getVerificationStatus(userId)
            
            return this.handleSuccess(res, status)
        } catch (error) {
            return this.handleError(error, res)
        }
    }
}
