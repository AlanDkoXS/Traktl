import { Router } from 'express'
import { TimeEntryController } from '../controllers'
import { validateJWT, timeEntryRateLimit, databaseOperationsRateLimit } from '../middlewares'
import { TimeEntryService } from '../../domain/services/timeEntry/timeEntryService'
import { MongoTimeEntryRepository } from '../../infrastructure/repositories/mongodb'

const timeEntryRepository = new MongoTimeEntryRepository()
const timeEntryService = new TimeEntryService(timeEntryRepository)
const controller = new TimeEntryController(timeEntryService)

const router = Router()

router.use(validateJWT)
router.use(timeEntryRateLimit)

// Timer specific operations
router.post('/start', controller.startTimeEntry)
router.post('/stop', controller.stopTimeEntry)
router.get('/running', controller.getRunningTimeEntry)

router.post('/', controller.createTimeEntry)
router.get('/:id', controller.getTimeEntryById)
router.put('/:id', controller.updateTimeEntry)
router.delete('/:id', controller.deleteTimeEntry)
router.get('/', databaseOperationsRateLimit, controller.listTimeEntries)

export const timeEntryRoutes = router
