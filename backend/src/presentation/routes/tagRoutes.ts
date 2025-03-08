import { Router } from 'express'
import { TagController } from '../controllers'
import { validateJWT } from '../middlewares'
import { TagService } from '../../domain/services/tag/tagService'
import { MongoTagRepository } from '../../infrastructure/repositories/mongodb'

// Create repository and service
const tagRepository = new MongoTagRepository()
const tagService = new TagService(tagRepository)
const controller = new TagController(tagService)

const router = Router()

// All routes require authentication
router.use(validateJWT)

// CRUD operations
router.post('/', controller.createTag)
router.get('/:id', controller.getTagById)
router.put('/:id', controller.updateTag)
router.delete('/:id', controller.deleteTag)
router.get('/', controller.listTags)

export const tagRoutes = router
