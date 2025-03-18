import { Project, ProjectEntity } from '../entities/project.entity'

export interface ProjectRepository {
	create(project: ProjectEntity): Promise<Project>

	findById(id: string): Promise<Project | null>

	update(id: string, project: Partial<ProjectEntity>): Promise<Project | null>

	delete(id: string): Promise<boolean>

	listByUser(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<Project[]>

	findByCriteria(criteria: Partial<ProjectEntity>): Promise<Project[]>

	countByUser(userId: string): Promise<number>
}
