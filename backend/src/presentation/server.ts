import express, { Application, Router } from 'express'
import cors from 'cors'
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { errorMiddleware, socketAuthMiddleware } from './middlewares'
import { envs } from '../config'

interface Options {
	port: number
	routes: Router
}

export class Server {
	private readonly app: Application
	private readonly port: number
	private readonly routes: Router
	private httpServer: HttpServer
	private io: SocketIOServer

	constructor(options: Options) {
		this.app = express()
		this.port = options.port
		this.routes = options.routes
		this.httpServer = new HttpServer(this.app)

		// Initialize Socket.io server with CORS configuration
		this.io = new SocketIOServer(this.httpServer, {
			cors: {
				origin: envs.FRONTEND_URL || 'http://localhost:5173',
				methods: ['GET', 'POST'],
				credentials: true
			}
		})

		this.configureMiddlewares()
		this.configureRoutes()
		this.configureSocketIO()
	}

	private configureMiddlewares() {
		console.log('Configuring middlewares...')
		// CORS
		this.app.use(cors())

		// JSON body parser
		this.app.use(express.json())

		// URL-encoded body parser
		this.app.use(express.urlencoded({ extended: true }))

		// Log incoming requests
		this.app.use((req, res, next) => {
			console.log(`${req.method} ${req.originalUrl}`)
			next()
		})
	}

	private configureRoutes() {
		console.log('Configuring routes...')

		// API test route - defined directly with app.get
		this.app.get('/api/test', (req, res) => {
			console.log('API test route accessed')
			return res.status(200).json({
				ok: true,
				message: 'API test route works!',
				timestamp: new Date().toISOString(),
			})
		})

		// Main API routes
		this.app.use('/api', this.routes)

		// Direct test route
		this.app.get('/direct-test', (req, res) => {
			console.log('Direct test route accessed')
			return res.status(200).json({ message: 'Direct test route works!' })
		})

		// Not found handler - should always be last
		this.app.use('*', (req, res) => {
			console.log(`Route not found: ${req.originalUrl}`)
			return res.status(404).json({
				ok: false,
				message: `Route ${req.originalUrl} not found`,
			})
		})

		// Error handler middleware
		this.app.use(errorMiddleware)
	}

	private configureSocketIO() {
		console.log('Configuring Socket.IO...')

		// Authentication middleware for Socket.IO
		this.io.use(socketAuthMiddleware)

		// Handle socket connections
		this.io.on('connection', (socket) => {
			console.log(`Socket connected: ${socket.id}`)

			// Create a room for this user
			const userId = socket.data.userId
			if (userId) {
				socket.join(`user-${userId}`)
				console.log(`User ${userId} joined their room`)
			}

			// Handle timer events
			socket.on('timer:start', (data) => {
				console.log('Timer started:', data)
				// Broadcast to all devices for this user
				socket.to(`user-${userId}`).emit('timer:start', data)
			})

			socket.on('timer:pause', (data) => {
				console.log('Timer paused:', data)
				socket.to(`user-${userId}`).emit('timer:pause', data)
			})

			socket.on('timer:resume', (data) => {
				console.log('Timer resumed:', data)
				socket.to(`user-${userId}`).emit('timer:resume', data)
			})

			socket.on('timer:stop', (data) => {
				console.log('Timer stopped:', data)
				socket.to(`user-${userId}`).emit('timer:stop', data)
			})

			socket.on('timer:tick', (data) => {
				// Don't log each tick to prevent console flooding
				socket.to(`user-${userId}`).emit('timer:tick', data)
			})

			// Handle synchronization events for other entities
			socket.on('sync:timeEntry', (data) => {
				console.log('Time entry sync:', data)
				socket.to(`user-${userId}`).emit('sync:timeEntry', data)
			})

			socket.on('sync:project', (data) => {
				console.log('Project sync:', data)
				socket.to(`user-${userId}`).emit('sync:project', data)
			})

			socket.on('sync:task', (data) => {
				console.log('Task sync:', data)
				socket.to(`user-${userId}`).emit('sync:task', data)
			})

			socket.on('sync:client', (data) => {
				console.log('Client sync:', data)
				socket.to(`user-${userId}`).emit('sync:client', data)
			})

			socket.on('sync:timerPreset', (data) => {
				console.log('Timer preset sync:', data)
				socket.to(`user-${userId}`).emit('sync:timerPreset', data)
			})

			// Handle reconnection
			socket.on('reconnect', () => {
				console.log(`Socket reconnected: ${socket.id}`)
				if (userId) {
					socket.join(`user-${userId}`)
					console.log(`User ${userId} rejoined their room after reconnection`)
				}
			})

			// Handle disconnection
			socket.on('disconnect', () => {
				console.log(`Socket disconnected: ${socket.id}`)
			})
		})
	}

	async start() {
		return new Promise<void>((resolve) => {
			this.httpServer.listen(this.port, () => {
				console.log(`🖳  Server running on port: ${this.port}`)
				console.log(`Environment: ${envs.NODE_ENV}`)
				console.log(`Test URLs:`)
				console.log(`- http://localhost:${this.port}/api/test`)
				console.log(`- http://localhost:${this.port}/direct-test`)
				console.log(`🔌 Socket.IO server is ready`)
				resolve()
			})
		})
	}

	// Method to get the Socket.IO instance for use in other parts of the application
	public getIO(): SocketIOServer {
		return this.io
	}
}
