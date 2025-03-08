import express, { Application, Router } from 'express'
import cors from 'cors'
import { errorMiddleware } from './middlewares'
import { envs } from '../config'

interface Options {
    port: number
    routes: Router
}

export class Server {
    private readonly app: Application
    private readonly port: number
    private readonly routes: Router

    constructor(options: Options) {
        this.app = express()
        this.port = options.port
        this.routes = options.routes

        this.configureMiddlewares()
        this.configureRoutes()
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
                timestamp: new Date().toISOString()
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
                message: `Route ${req.originalUrl} not found`
            })
        })

        // Error handler middleware
        this.app.use(errorMiddleware)
    }

    async start() {
        return new Promise<void>((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`🖳  Server running on port: ${this.port}`)
                console.log(`Environment: ${envs.NODE_ENV}`)
                console.log(`Test URLs:`)
                console.log(`- http://localhost:${this.port}/api/test`)
                console.log(`- http://localhost:${this.port}/direct-test`)
                resolve()
            })
        })
    }
}
