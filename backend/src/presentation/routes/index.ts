import { Router } from 'express'
import { userRoutes } from './userRoutes'
import { projectRoutes } from './projectRoutes'
import { clientRoutes } from './clientRoutes'
import { taskRoutes } from './taskRoutes'
import { timeEntryRoutes } from './timeEntryRoutes'
import { tagRoutes } from './tagRoutes'
import { timerPresetRoutes } from './timerPresetRoutes'

const router = Router()

// Test route - make sure it's defined FIRST for visibility
router.get('/test', (req, res) => {
	console.log('>>> Test route handler executed!')
	return res.status(200).json({
		ok: true,
		message: 'API working correctly!',
		timestamp: new Date().toISOString(),
	})
})

// Register all routes
router.use('/users', userRoutes)
router.use('/projects', projectRoutes)
router.use('/clients', clientRoutes)
router.use('/tasks', taskRoutes)
router.use('/time-entries', timeEntryRoutes)
router.use('/tags', tagRoutes)
router.use('/timer-presets', timerPresetRoutes)

export { router }
