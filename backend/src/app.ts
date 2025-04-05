import 'reflect-metadata'
import { envs } from './config'
import { MongoDatabase } from './data/mongodb'
import { Server } from './presentation/server'
import { AppRoutes } from './presentation/routes'

const logInfo = (message: string) => {
	if (envs.NODE_ENV !== 'test') {
		console.info(`[INFO] ${message}`)
	}
}

const logError = (message: string, error: unknown) => {
	if (envs.NODE_ENV !== 'test') {
		console.error(`[ERROR] ${message}:`, error)
	}
}

async function main() {
	try {
		// Connect to database
		logInfo('Connecting to MongoDB...')
		await MongoDatabase.connect()

		// Create server with routes
		logInfo('Initializing server...')
		const server = new Server({
			port: envs.PORT,
			routes: AppRoutes.routes,
		})

		// Start server
		logInfo('Starting server...')
		await server.start()
	} catch (error) {
		logError('Error starting application', error)
		process.exit(1)
	}
}

// Initialize application
logInfo('Initializing application...')
main()
