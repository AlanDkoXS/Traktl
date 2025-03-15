import { Router } from 'express'
import { UserController } from '../controllers'
import { UserService } from '../../domain/services/user/userService'
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/mongoUserRepository'
import { validateJWT } from '../middlewares'
import { GoogleAuthController } from '../controllers/googleAuthController'

// Create repository and service
const userRepository = new MongoUserRepository()
const userService = new UserService(userRepository)

// Create controllers
const controller = new UserController(userService)
const googleAuthController = new GoogleAuthController(userService)

const router = Router()

// Public routes
router.post('/register', (req, res) => {
    console.log('Register route accessed')
    controller.register(req, res)
})

router.post('/login', (req, res) => {
    console.log('Login route accessed')
    controller.login(req, res)
})

// Google Auth routes
router.post('/google', (req, res) => {
    console.log('Google auth route accessed')
    googleAuthController.googleLogin(req, res)
})

// Protected routes
router.get('/profile', validateJWT, (req, res) => {
    console.log('Profile route accessed')
    controller.getProfile(req, res)
})

router.put('/profile', validateJWT, (req, res) => {
    console.log('Update profile route accessed')
    controller.updateProfile(req, res)
})

export const userRoutes = router
