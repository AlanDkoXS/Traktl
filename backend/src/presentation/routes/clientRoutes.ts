import { Router } from 'express';
import { ClientController } from '../controllers';
import { validateJWT } from '../middlewares'
import { ClientService } from '../../domain/services/client/clientService';
import { MongoClientRepository } from '../../infrastructure/repositories/mongodb';

// Create repository and service
const clientRepository = new MongoClientRepository();
const clientService = new ClientService(clientRepository);
const controller = new ClientController(clientService);

const router = Router();

// All routes require authentication
router.use(validateJWT);

// CRUD operations
router.post('/', controller.createClient);
router.get('/:id', controller.getClientById);
router.put('/:id', controller.updateClient);
router.delete('/:id', controller.deleteClient);
router.get('/', controller.listClients);

export const clientRoutes = router;
