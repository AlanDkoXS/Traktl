import { Router } from 'express';
import { ProjectController } from '../controllers';
import { validateJWT } from '../middlewares'
import { ProjectService } from '../../domain/services/project/projectService';
import { MongoProjectRepository } from '../../infrastructure/repositories/mongodb';

// Create repository and service
const projectRepository = new MongoProjectRepository();
const projectService = new ProjectService(projectRepository);
const controller = new ProjectController(projectService);

const router = Router();

// All routes require authentication
router.use(validateJWT);

// CRUD operations
router.post('/', controller.createProject);
router.get('/:id', controller.getProjectById);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);
router.get('/', controller.listProjects);

export const projectRoutes = router;
