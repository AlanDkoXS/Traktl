import { Router } from 'express'
import { UserController } from '../controllers'
import { UserService } from '../../domain/services/user/userService'
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/mongoUserRepository'
import { validateJWT } from '../middlewares'

// Create repository and service
const userRepository = new MongoUserRepository()
const userService = new UserService(userRepository)

// Create controller with service
const controller = new UserController(userService)

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
