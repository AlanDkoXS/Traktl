import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { UserService } from '../../domain/services/user/userService'
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class UserController extends BaseController {
    constructor(private readonly userService: UserService) {
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
}
