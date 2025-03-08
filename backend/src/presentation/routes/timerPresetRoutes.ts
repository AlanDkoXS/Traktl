import { Router } from 'express'
import { TimerPresetController } from '../controllers'
import { validateJWT } from '../middlewares'
import { TimerPresetService } from '../../domain/services/timerPreset/timerPresetService'
import { MongoTimerPresetRepository } from '../../infrastructure/repositories/mongodb'

// Create repository and service
const timerPresetRepository = new MongoTimerPresetRepository()
const timerPresetService = new TimerPresetService(timerPresetRepository)
const controller = new TimerPresetController(timerPresetService)

const router = Router()

// All routes require authentication
router.use(validateJWT)

// CRUD operations
router.post('/', controller.createTimerPreset)
router.get('/:id', controller.getTimerPresetById)
router.put('/:id', controller.updateTimerPreset)
router.delete('/:id', controller.deleteTimerPreset)
router.get('/', controller.listTimerPresets)

export const timerPresetRoutes = router
