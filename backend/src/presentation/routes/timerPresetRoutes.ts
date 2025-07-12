import { Router } from 'express'
import { TimerPresetController } from '../controllers'
import { validateJWT, databaseOperationsRateLimit } from '../middlewares'
import { TimerPresetService } from '../../domain/services/timerPreset/timerPresetService'
import { MongoTimerPresetRepository } from '../../infrastructure/repositories/mongodb'

const timerPresetRepository = new MongoTimerPresetRepository()
const timerPresetService = new TimerPresetService(timerPresetRepository)
const controller = new TimerPresetController(timerPresetService)

const router = Router()

router.use(validateJWT)
router.use(databaseOperationsRateLimit)

router.post('/', controller.createTimerPreset)
router.get('/:id', controller.getTimerPresetById)
router.put('/:id', controller.updateTimerPreset)
router.delete('/:id', controller.deleteTimerPreset)
router.get('/', controller.listTimerPresets)
router.post('/sync-settings', controller.syncSettings)

export const timerPresetRoutes = router
