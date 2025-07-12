import { Router } from 'express'
import { UserController } from '../controllers'
import { UserService } from '../../domain/services/user/userService'
import { VerificationService } from '../../domain/services/user/verificationService'
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/mongoUserRepository'
import { MongoProjectRepository } from '../../infrastructure/repositories/mongodb/mongoProjectRepository'
import { MongoTimerPresetRepository } from '../../infrastructure/repositories/mongodb/mongoTimerPresetRepository'
import { 
	validateJWT, 
	authRateLimit, 
	emailRateLimit, 
	passwordResetRateLimit, 
	registrationRateLimit,
	databaseOperationsRateLimit 
} from '../middlewares'
import { GoogleAuthController } from '../controllers/googleAuthController'
import { EmailService } from '../../service/emailService'

console.log('Creating repositories for user routes...')
const userRepository = new MongoUserRepository()
const projectRepository = new MongoProjectRepository()
const timerPresetRepository = new MongoTimerPresetRepository()

const emailService = new EmailService()

console.log('Creating UserService with UserInitService...')
const userService = new UserService(
	userRepository,
	projectRepository,
	timerPresetRepository,
	emailService,
)

const verificationService = new VerificationService(
	userRepository,
	emailService,
)

console.log('Creating controllers for user routes...')
const controller = new UserController(userService, verificationService)
const googleAuthController = new GoogleAuthController(userService)

const router = Router()

router.post('/register', registrationRateLimit, controller.register)
router.post('/login', authRateLimit, controller.login)

router.post('/google', googleAuthController.googleLogin)

router.post('/forgot-password', emailRateLimit, controller.forgotPassword)
router.post('/reset-password', passwordResetRateLimit, controller.resetPassword)

router.get('/profile', validateJWT, databaseOperationsRateLimit, controller.getProfile)
router.put('/profile', validateJWT, databaseOperationsRateLimit, controller.updateProfile)
router.delete('/profile', validateJWT, databaseOperationsRateLimit, controller.deleteUser)

router.put('/change-password', validateJWT, authRateLimit, controller.changePassword)

router.post(
	'/request-verification',
	validateJWT,
	emailRateLimit,
	controller.requestVerification,
)
router.post('/verify-email', controller.verifyEmail)
router.get(
	'/verification-status',
	validateJWT,
	databaseOperationsRateLimit,
	controller.getVerificationStatus,
)

console.log('User routes configured successfully')
export const userRoutes = router
