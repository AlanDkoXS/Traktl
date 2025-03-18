import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { TaskService } from '../../domain/services/task/taskService'
import { CreateTaskDTO, UpdateTaskDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'
import mongoose from 'mongoose'

export class TaskController extends BaseController {
	constructor(private readonly taskService: TaskService) {
		super()
	}

	public createTask = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const [error, createTaskDto] = CreateTaskDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			// Validate ObjectId format
			if (!mongoose.Types.ObjectId.isValid(createTaskDto!.project)) {
				return res.status(400).json({
					error: 'Invalid project ID format. Must be a valid MongoDB ObjectID',
				})
			}

			const task = await this.taskService.createTask(
				userId,
				createTaskDto!,
			)
			return this.handleSuccess(res, task, 201)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getTaskById = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			const task = await this.taskService.getTaskById(userId, id)
			return this.handleSuccess(res, task)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public updateTask = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			const [error, updateTaskDto] = UpdateTaskDTO.create(req.body)
			if (error) return res.status(400).json({ error })

			// Validate ObjectId format for project if provided
			if (
				updateTaskDto!.project &&
				!mongoose.Types.ObjectId.isValid(updateTaskDto!.project)
			) {
				return res.status(400).json({
					error: 'Invalid project ID format. Must be a valid MongoDB ObjectID',
				})
			}

			const updatedTask = await this.taskService.updateTask(
				userId,
				id,
				updateTaskDto!,
			)
			return this.handleSuccess(res, updatedTask)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public deleteTask = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const { id } = req.params
			await this.taskService.deleteTask(userId, id)
			return this.handleSuccess(res, {
				message: 'Task deleted successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public listTasks = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })

			const page = req.query.page
				? parseInt(req.query.page as string)
				: undefined
			const limit = req.query.limit
				? parseInt(req.query.limit as string)
				: undefined
			const projectId = req.query.projectId as string | undefined

			// Validate ObjectId format for projectId if provided
			if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
				return res.status(400).json({
					error: 'Invalid project ID format. Must be a valid MongoDB ObjectID',
				})
			}

			let tasks
			if (projectId) {
				tasks = await this.taskService.listTasksByProject(
					projectId,
					page,
					limit,
				)
			} else {
				tasks = await this.taskService.listTasks(userId, page, limit)
			}

			return this.handleSuccess(res, tasks)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}
