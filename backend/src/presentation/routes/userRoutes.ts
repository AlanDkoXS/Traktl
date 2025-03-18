import { Router } from 'express'
import { UserController } from '../controllers'
import { UserService } from '../../domain/services/user/userService'
import { VerificationService } from '../../domain/services/user/verificationService'
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/mongoUserRepository'
import { validateJWT } from '../middlewares'
import { GoogleAuthController } from '../controllers/googleAuthController'
import { EmailService } from '../../service/emailService'

// Create repository and services
const userRepository = new MongoUserRepository()
const userService = new UserService(userRepository)
const emailService = new EmailService()
const verificationService = new VerificationService(
	userRepository,
	emailService,
)

// Create controllers
const controller = new UserController(userService, verificationService)
const googleAuthController = new GoogleAuthController(userService)

const router = Router()

// Public routes
router.post('/register', controller.register)
router.post('/login', controller.login)

// Google Auth routes
router.post('/google', googleAuthController.googleLogin)

// Password recovery
router.post('/forgot-password', controller.forgotPassword)
router.post('/reset-password', controller.resetPassword)

// Protected routes
router.get('/profile', validateJWT, controller.getProfile)
router.put('/profile', validateJWT, controller.updateProfile)

// Password management
router.put('/change-password', validateJWT, controller.changePassword)

// Email verification routes
router.post(
	'/request-verification',
	validateJWT,
	controller.requestVerification,
)
router.post('/verify-email', controller.verifyEmail)
router.get(
	'/verification-status',
	validateJWT,
	controller.getVerificationStatus,
)

export const userRoutes = router
