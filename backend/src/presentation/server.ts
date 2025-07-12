import express, { Application, Router } from 'express'
import cors from 'cors'
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { errorMiddleware, socketAuthMiddleware, generalRateLimit } from './middlewares'
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

		// Apply general rate limiting to all routes
		this.app.use(generalRateLimit)

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
			console.log(`Cliente conectado: ${socket.id} - Usuario: ${socket.data.userId}`)

			socket.join(`user-${socket.data.userId}`)

			socket.on('timer:requestSync', (data) => {
				console.log(`Sync requested by user ${socket.data.userId}`)
				socket.to(`user-${socket.data.userId}`).emit('timer:requestState', data)
			})

			const timerEvents = ['timer:start', 'timer:pause', 'timer:resume', 'timer:stop', 'timer:tick']

			timerEvents.forEach(event => {
				socket.on(event, (data) => {
					console.log(`${event} received from ${socket.data.userId}:`, data)
					socket.to(`user-${socket.data.userId}`).emit(event, {
						...data,
						timestamp: new Date(),
						userId: socket.data.userId
					})
				})
			})

			socket.on('disconnect', () => {
				console.log(`Cliente desconectado: ${socket.id} - Usuario: ${socket.data.userId}`)
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
