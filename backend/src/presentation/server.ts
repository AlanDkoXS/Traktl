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

		this.io = new SocketIOServer(this.httpServer, {
			cors: {
				origin: envs.FRONTEND_URL || '*',
				methods: ['GET', 'POST'],
				credentials: true,
			},
		})

		this.configureMiddlewares()
		this.configureRoutes()
		this.configureSocketIO()
	}

	private configureMiddlewares() {
		console.log('Configuring middlewares...')
		this.app.use(
			cors({
				origin: envs.FRONTEND_URL || '*',
				credentials: true,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
				allowedHeaders: [
					'Content-Type',
					'Authorization',
					'x-auth-token',
				],
			}),
		)

		this.app.use(express.json())

		this.app.use(express.urlencoded({ extended: true }))

		this.app.use((req, res, next) => {
			console.log(`${req.method} ${req.originalUrl}`)
			next()
		})
	}

	private configureRoutes() {
		console.log('Configuring routes...')

		this.app.get('/api/test', (req, res) => {
			console.log('API test route accessed')
			return res.status(200).json({
				ok: true,
				message: 'API test route works!',
				timestamp: new Date().toISOString(),
			})
		})

		this.app.use('/api', this.routes)

		this.app.get('/direct-test', (req, res) => {
			console.log('Direct test route accessed')
			return res.status(200).json({ message: 'Direct test route works!' })
		})

		this.app.use('*', (req, res) => {
			console.log(`Route not found: ${req.originalUrl}`)
			return res.status(404).json({
				ok: false,
				message: `Route ${req.originalUrl} not found`,
			})
		})

		this.app.use(errorMiddleware)
	}

	private configureSocketIO() {
		console.log('Configuring Socket.IO...')

		this.io.use(socketAuthMiddleware)

		this.io.on('connection', (socket) => {
			console.log(`Socket connected: ${socket.id}`)

			const userId = socket.data.userId
			if (userId) {
				socket.join(`user-${userId}`)
				console.log(`User ${userId} joined their room`)
			}

			socket.on('timer:start', (data) => {
				console.log('Timer started:', data)
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
				socket.to(`user-${userId}`).emit('timer:tick', data)
			})

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

			socket.on('reconnect', () => {
				console.log(`Socket reconnected: ${socket.id}`)
				if (userId) {
					socket.join(`user-${userId}`)
					console.log(
						`User ${userId} rejoined their room after reconnection`,
					)
				}
			})

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
				console.log(`🔌 Socket.IO server is ready`)
				resolve()
			})
		})
	}

	public getIO(): SocketIOServer {
		return this.io
	}
}
