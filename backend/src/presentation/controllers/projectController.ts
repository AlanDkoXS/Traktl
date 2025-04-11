import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { ProjectService } from '../../domain/services/project/projectService'
import { CreateProjectDTO, UpdateProjectDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class ProjectController extends BaseController {
	constructor(private readonly projectService: ProjectService) {
		super()
	}

	public createProject = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const [error, createProjectDto] = CreateProjectDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			const project = await this.projectService.createProject(
				userId,
				createProjectDto!,
			)
			return this.handleSuccess(res, project, 201)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getProjectById = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params

			if (!id || typeof id !== 'string' || id === 'undefined') {
				return res.status(400).json({ error: 'Invalid project ID' })
			}

			const project = await this.projectService.getProjectById(userId, id)
			return this.handleSuccess(res, project)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public updateProject = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			const [error, updateProjectDto] = UpdateProjectDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			const updatedProject = await this.projectService.updateProject(
				userId,
				id,
				updateProjectDto!,
			)
			return this.handleSuccess(res, updatedProject)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public deleteProject = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			await this.projectService.deleteProject(userId, id)
			return this.handleSuccess(res, {
				message: 'Project deleted successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public listProjects = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const page = req.query.page
				? parseInt(req.query.page as string)
				: undefined
			const limit = req.query.limit
				? parseInt(req.query.limit as string)
				: undefined

			const projects = await this.projectService.listProjects(
				userId,
				page,
				limit,
			)
			return this.handleSuccess(res, projects)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}
