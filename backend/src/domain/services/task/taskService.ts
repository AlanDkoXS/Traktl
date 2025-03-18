import { TaskRepository } from '../../repositories/taskRepository.interface'
import { Task, TaskEntity } from '../../entities/task.entity'
import { CreateTaskDTO } from '../../dtos/task/create-task.dto'
import { UpdateTaskDTO } from '../../dtos/task/update-task.dto'
import { CustomError } from '../../errors/custom.errors'
import mongoose from 'mongoose'

export class TaskService {
	constructor(private readonly taskRepository: TaskRepository) {}

	async createTask(
		userId: string,
		createTaskDto: CreateTaskDTO,
	): Promise<Task> {
		// Double-check ObjectId validity
		if (!mongoose.Types.ObjectId.isValid(createTaskDto.project)) {
			throw CustomError.badRequest('Invalid project ID format')
		}

		const taskEntity: TaskEntity = {
			name: createTaskDto.name,
			description: createTaskDto.description || '',
			project: createTaskDto.project,
			status: createTaskDto.status || 'pending',
			user: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		return await this.taskRepository.create(taskEntity)
	}

	async updateTask(
		userId: string,
		taskId: string,
		updateTaskDto: UpdateTaskDTO,
	): Promise<Task> {
		const existingTask = await this.taskRepository.findById(taskId)
		if (!existingTask || existingTask.user.toString() !== userId) {
			throw CustomError.notFound('Task not found')
		}

		// Validate project ID if provided
		if (
			updateTaskDto.project &&
			!mongoose.Types.ObjectId.isValid(updateTaskDto.project)
		) {
			throw CustomError.badRequest('Invalid project ID format')
		}

		const updatedTask = await this.taskRepository.update(
			taskId,
			updateTaskDto,
		)
		if (!updatedTask) {
			throw CustomError.internalServer('Error updating task')
		}

		return updatedTask
	}

	async getTaskById(userId: string, taskId: string): Promise<Task> {
		const task = await this.taskRepository.findById(taskId)

		if (!task || task.user.toString() !== userId) {
			throw CustomError.notFound('Task not found')
		}

		return task
	}

	async listTasks(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<Task[]> {
		return await this.taskRepository.listByUser(userId, page, limit)
	}

	async listTasksByProject(
		projectId: string,
		page?: number,
		limit?: number,
	): Promise<Task[]> {
		// Validate projectId format
		if (!mongoose.Types.ObjectId.isValid(projectId)) {
			throw CustomError.badRequest('Invalid project ID format')
		}

		return await this.taskRepository.listByProject(projectId, page, limit)
	}

	async deleteTask(userId: string, taskId: string): Promise<boolean> {
		const existingTask = await this.taskRepository.findById(taskId)
		if (!existingTask || existingTask.user.toString() !== userId) {
			throw CustomError.notFound('Task not found')
		}

		const deleted = await this.taskRepository.delete(taskId)
		if (!deleted) {
			throw CustomError.internalServer('Error deleting task')
		}

		return true
	}

	async countUserTasks(userId: string): Promise<number> {
		return await this.taskRepository.countByUser(userId)
	}

	async countProjectTasks(projectId: string): Promise<number> {
		// Validate projectId format
		if (!mongoose.Types.ObjectId.isValid(projectId)) {
			throw CustomError.badRequest('Invalid project ID format')
		}

		return await this.taskRepository.countByProject(projectId)
	}
}
