import { Task, TaskEntity } from '../entities/task.entity'

export interface TaskRepository {
	create(task: TaskEntity): Promise<Task>

	findById(id: string): Promise<Task | null>

	update(id: string, task: Partial<TaskEntity>): Promise<Task | null>

	delete(id: string): Promise<boolean>

	listByUser(userId: string, page?: number, limit?: number): Promise<Task[]>
	listByProject(
		projectId: string,
		page?: number,
		limit?: number,
	): Promise<Task[]>

	findByCriteria(criteria: Partial<TaskEntity>): Promise<Task[]>

	countByUser(userId: string): Promise<number>
	countByProject(projectId: string): Promise<number>
}
