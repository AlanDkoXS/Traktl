import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { TaskService } from '../../domain/services/task/taskService'
import { CreateTaskDTO, UpdateTaskDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

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

            const task = await this.taskService.createTask(
                userId,
                createTaskDto!
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

            const updatedTask = await this.taskService.updateTask(
                userId,
                id,
                updateTaskDto!
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

            let tasks
            if (projectId) {
                tasks = await this.taskService.listTasksByProject(
                    projectId,
                    page,
                    limit
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
