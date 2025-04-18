import { Router } from 'express'
import { router as apiRoutes } from './routes/index'

export class AppRoutes {
	static get routes(): Router {
		const router = Router()

		router.use('/', apiRoutes)

		return router
	}
}
