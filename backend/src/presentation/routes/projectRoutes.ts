import { Router } from 'express'
import { ProjectController } from '../controllers'
import { validateJWT } from '../middlewares'
import { ProjectService } from '../../domain/services/project/projectService'
import { MongoProjectRepository } from '../../infrastructure/repositories/mongodb'

const projectRepository = new MongoProjectRepository()
const projectService = new ProjectService(projectRepository)
const controller = new ProjectController(projectService)

const router = Router()

router.use(validateJWT)

router.post('/', controller.createProject)
router.get('/:id', controller.getProjectById)
router.put('/:id', controller.updateProject)
router.delete('/:id', controller.deleteProject)
router.get('/', controller.listProjects)

export const projectRoutes = router
