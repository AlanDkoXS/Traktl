import { Router } from 'express'
import { TimeEntryController } from '../controllers'
import { validateJWT } from '../middlewares'
import { TimeEntryService } from '../../domain/services/timeEntry/timeEntryService'
import { MongoTimeEntryRepository } from '../../infrastructure/repositories/mongodb'

// Create repository and service
const timeEntryRepository = new MongoTimeEntryRepository()
const timeEntryService = new TimeEntryService(timeEntryRepository)
const controller = new TimeEntryController(timeEntryService)

const router = Router()

// All routes require authentication
router.use(validateJWT)

// Timer specific operations
router.post('/start', controller.startTimeEntry)
router.post('/stop', controller.stopTimeEntry)
router.get('/running', controller.getRunningTimeEntry)

// CRUD operations
router.post('/', controller.createTimeEntry)
router.get('/:id', controller.getTimeEntryById)
router.put('/:id', controller.updateTimeEntry)
router.delete('/:id', controller.deleteTimeEntry)
router.get('/', controller.listTimeEntries)

export const timeEntryRoutes = router
