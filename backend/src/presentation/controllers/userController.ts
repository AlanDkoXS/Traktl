import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { UserService } from '../../domain/services/user/userService'
import { VerificationService } from '../../domain/services/user/verificationService'
import {
	CreateUserDTO,
	LoginUserDTO,
	UpdateUserDTO,
	VerifyEmailDTO,
	RequestVerificationDTO,
	ForgotPasswordDTO,
	ResetPasswordDTO,
} from '../../domain/dtos'
import { ChangePasswordDTO } from '../../domain/dtos/change-password.dto'
import '../../domain/types/request-extension'
import { MongoProjectRepository } from '../../infrastructure/repositories/mongodb/mongoProjectRepository'
import { MongoTimerPresetRepository } from '../../infrastructure/repositories/mongodb/mongoTimerPresetRepository'
import { ProjectEntity } from '../../domain/entities/project.entity'
import { TimerPresetEntity } from '../../domain/entities/timer-preset.entity'

export class UserController extends BaseController {
	private projectRepository: MongoProjectRepository;
	private timerPresetRepository: MongoTimerPresetRepository;

	constructor(
		private readonly userService: UserService,
		private readonly verificationService: VerificationService,
	) {
		super()
		// Crear instancias de los repositorios directamente
		this.projectRepository = new MongoProjectRepository();
		this.timerPresetRepository = new MongoTimerPresetRepository();
		console.log('UserController initialized with direct repositories')
	}

	public register = async (req: Request, res: Response) => {
		try {
			const [error, createUserDto] = CreateUserDTO.create(req.body)
			if (error) return res.status(400).json({ error })
			
			// Registrar el usuario normalmente
			const result = await this.userService.registerUser(createUserDto!)
			
			// Si el registro fue exitoso, crear los presets y proyectos directamente
			if (result && result.user && result.user._id) {
				try {
					console.log('Starting direct creation of defaults for user:', result.user._id);
					
					// Obtener fecha actual para createdAt y updatedAt
					const now = new Date();
					
					// Crear proyecto Focus
					const focusProject = await this.projectRepository.create({
						name: 'Focus',
						description: 'Default project for focused work sessions',
						color: '#33d17a',
						user: result.user._id,
						status: 'active',
						createdAt: now,
						updatedAt: now
					} as ProjectEntity);
					console.log('Focus project created:', focusProject?._id);
					
					// Crear preset Pomodoro
					const pomodoroPreset = await this.timerPresetRepository.create({
						name: '🍅 Pomodoro',
						workDuration: 25,
						breakDuration: 5,
						repetitions: 4,
						user: result.user._id,
						createdAt: now,
						updatedAt: now
					} as TimerPresetEntity);
					console.log('Pomodoro preset created:', pomodoroPreset?._id);
					
					// Crear preset 52/17
					const workBreakPreset = await this.timerPresetRepository.create({
						name: '💻 52/17',
						workDuration: 52,
						breakDuration: 17,
						repetitions: 4,
						user: result.user._id,
						createdAt: now,
						updatedAt: now
					} as TimerPresetEntity);
					console.log('52/17 preset created:', workBreakPreset?._id);
					
					// Actualizar el usuario con el preset predeterminado
					if (pomodoroPreset && pomodoroPreset._id) {
						await this.userService.updateUser(result.user._id, {
							defaultTimerPreset: pomodoroPreset._id.toString()
						});
						console.log('User updated with default timer preset');
					}
				} catch (initError) {
					console.error('Error creating default settings in controller:', initError);
					// No fallar el registro si la inicialización falla
				}
			}
			
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
				updateUserDto!,
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

			const [error, changePasswordDto] = ChangePasswordDTO.create(
				req.body,
			)
			if (error) return res.status(400).json({ error })

			const result = await this.userService.changePassword(
				userId,
				changePasswordDto!.currentPassword,
				changePasswordDto!.newPassword,
			)

			return this.handleSuccess(res, {
				message: 'Password updated successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public forgotPassword = async (req: Request, res: Response) => {
		try {
			const [error, forgotPasswordDto] = ForgotPasswordDTO.create(
				req.body,
			)
			if (error) return res.status(400).json({ error })

			await this.userService.forgotPassword(forgotPasswordDto!.email)

			// Always return success even if email doesn't exist (security)
			return this.handleSuccess(res, {
				message:
					'If your email exists in our system, you will receive password reset instructions',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public resetPassword = async (req: Request, res: Response) => {
		try {
			const [error, resetPasswordDto] = ResetPasswordDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			await this.userService.resetPassword(
				resetPasswordDto!.token,
				resetPasswordDto!.password,
			)

			return this.handleSuccess(res, {
				message: 'Password has been reset successfully',
			})
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

			await this.verificationService.requestVerification(
				userId,
				user.email,
			)

			return this.handleSuccess(res, {
				message: 'Verification email sent successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public verifyEmail = async (req: Request, res: Response) => {
		try {
			const [error, verifyEmailDto] = VerifyEmailDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			await this.verificationService.verifyEmail(verifyEmailDto!.token)

			return this.handleSuccess(res, {
				message: 'Email verified successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getVerificationStatus = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const status =
				await this.verificationService.getVerificationStatus(userId)

			return this.handleSuccess(res, status)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}
