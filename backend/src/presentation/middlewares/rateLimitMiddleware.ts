import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// General rate limit for all routes
export const generalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // Limit each IP to 1000 requests per window
	message: {
		error: 'Too many requests from this IP, please try again later',
		retryAfter: '15 minutes',
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (req: Request, res: Response) => {
		console.log(`Rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many requests from this IP, please try again later',
			retryAfter: '15 minutes',
		})
	},
})

// Rate limit for authentication endpoints (moderate to prevent brute force)
export const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 login attempts per windowMs
	message: {
		error: 'Too many authentication attempts from this IP, please try again later',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful requests
	handler: (req: Request, res: Response) => {
		console.log(`Auth rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many authentication attempts from this IP, please try again later',
			retryAfter: '15 minutes',
		})
	},
})

// Rate limit for email sending operations (very strict)
export const emailRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 email requests per hour
	message: {
		error: 'Too many email requests from this IP, please try again later',
		retryAfter: '1 hour',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		console.log(`Email rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many email requests from this IP, please try again later',
			retryAfter: '1 hour',
		})
	},
})

// Rate limit for password reset (strict)
export const passwordResetRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 password reset attempts per hour
	message: {
		error: 'Too many password reset attempts from this IP, please try again later',
		retryAfter: '1 hour',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		console.log(`Password reset rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many password reset attempts from this IP, please try again later',
			retryAfter: '1 hour',
		})
	},
})

// Rate limit for user registration (moderate)
export const registrationRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 registration attempts per hour
	message: {
		error: 'Too many registration attempts from this IP, please try again later',
		retryAfter: '1 hour',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		console.log(`Registration rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many registration attempts from this IP, please try again later',
			retryAfter: '1 hour',
		})
	},
})

// Rate limit for database operations
export const databaseOperationsRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 database operations per minute
	message: {
		error: 'Too many requests from this IP, please try again later',
		retryAfter: '1 minute',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		console.log(`Database operations rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many requests from this IP, please try again later',
			retryAfter: '1 minute',
		})
	},
})

// Rate limit for time entries operations
export const timeEntryRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 120, // Limit each IP to 120 time entry operations per minute
	message: {
		error: 'Too many time entry requests from this IP, please try again later',
		retryAfter: '1 minute',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		console.log(`Time entry rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: 'Too many time entry requests from this IP, please try again later',
			retryAfter: '1 minute',
		})
	},
})
