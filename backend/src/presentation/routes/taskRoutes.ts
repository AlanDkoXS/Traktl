import { Router } from 'express'
import { TaskController } from '../controllers'
import { validateJWT } from '../middlewares'
import { TaskService } from '../../domain/services/task/taskService'
import { MongoTaskRepository } from '../../infrastructure/repositories/mongodb'

const taskRepository = new MongoTaskRepository()
const taskService = new TaskService(taskRepository)
const controller = new TaskController(taskService)

const router = Router()

router.use(validateJWT)

router.post('/', controller.createTask)
router.get('/:id', controller.getTaskById)
router.put('/:id', controller.updateTask)
router.delete('/:id', controller.deleteTask)
router.get('/', controller.listTasks)

export const taskRoutes = router
