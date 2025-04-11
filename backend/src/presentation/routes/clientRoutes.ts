import { Router } from 'express'
import { ClientController } from '../controllers'
import { validateJWT } from '../middlewares'
import { ClientService } from '../../domain/services/client/clientService'
import { MongoClientRepository } from '../../infrastructure/repositories/mongodb'

const clientRepository = new MongoClientRepository()
const clientService = new ClientService(clientRepository)
const controller = new ClientController(clientService)

const router = Router()

router.use(validateJWT)

router.post('/', controller.createClient)
router.get('/:id', controller.getClientById)
router.put('/:id', controller.updateClient)
router.delete('/:id', controller.deleteClient)
router.get('/', controller.listClients)

export const clientRoutes = router
