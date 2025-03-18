import 'reflect-metadata'
import { envs } from './config'
import { MongoDatabase } from './data/mongodb'
import { Server } from './presentation/server'
import { AppRoutes } from './presentation/routes'

async function main() {
	try {
		// Connect to database
		console.log('Connecting to MongoDB...')
		await MongoDatabase.connect()

		// Create server with routes
		console.log('Initializing server...')
		const server = new Server({
			port: envs.PORT,
			routes: AppRoutes.routes,
		})

		// Start server
		console.log('Starting server...')
		await server.start()
	} catch (error) {
		console.error('Error starting application:', error)
	}
}

// Initialize application
console.log('Initializing application...')
main()
