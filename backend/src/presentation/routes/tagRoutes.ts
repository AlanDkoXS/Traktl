import { Router } from 'express'
import { TagController } from '../controllers'
import { validateJWT, databaseOperationsRateLimit } from '../middlewares'
import { TagService } from '../../domain/services/tag/tagService'
import { MongoTagRepository } from '../../infrastructure/repositories/mongodb'

const tagRepository = new MongoTagRepository()
const tagService = new TagService(tagRepository)
const controller = new TagController(tagService)

const router = Router()

router.use(validateJWT)
router.use(databaseOperationsRateLimit)

router.post('/', controller.createTag)
router.get('/:id', controller.getTagById)
router.put('/:id', controller.updateTag)
router.delete('/:id', controller.deleteTag)
router.get('/', controller.listTags)

export const tagRoutes = router
