import { ProjectRepository } from '../../repositories/projectRepository.interface'
import { Project, ProjectEntity } from '../../entities/project.entity'
import { CreateProjectDTO } from '../../dtos/project/create-project.dto'
import { UpdateProjectDTO } from '../../dtos/project/update-project.dto'
import { CustomError } from '../../errors/custom.errors'

export class ProjectService {
    constructor(private readonly projectRepository: ProjectRepository) {}

    async createProject(
        userId: string,
        createProjectDto: CreateProjectDTO
    ): Promise<Project> {
        const projectEntity: ProjectEntity = {
            name: createProjectDto.name,
            description: createProjectDto.description || '',
            color: createProjectDto.color || '#3498db',
            client: createProjectDto.client,
            status: createProjectDto.status || 'active',
            user: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        return await this.projectRepository.create(projectEntity)
    }

    async updateProject(
        userId: string,
        projectId: string,
        updateProjectDto: UpdateProjectDTO
    ): Promise<Project> {
        const existingProject = await this.projectRepository.findById(projectId)
        if (!existingProject || existingProject.user.toString() !== userId) {
            throw CustomError.notFound('Project not found')
        }

        const updatedProject = await this.projectRepository.update(
            projectId,
            updateProjectDto
        )
        if (!updatedProject) {
            throw CustomError.internalServer('Error updating project')
        }

        return updatedProject
    }

    async getProjectById(userId: string, projectId: string): Promise<Project> {
        const project = await this.projectRepository.findById(projectId)

        if (!project || project.user.toString() !== userId) {
            throw CustomError.notFound('Project not found')
        }

        return project
    }

    async listProjects(
        userId: string,
        page?: number,
        limit?: number
    ): Promise<Project[]> {
        return await this.projectRepository.listByUser(userId, page, limit)
    }

    async deleteProject(userId: string, projectId: string): Promise<boolean> {
        const existingProject = await this.projectRepository.findById(projectId)
        if (!existingProject || existingProject.user.toString() !== userId) {
            throw CustomError.notFound('Project not found')
        }

        const deleted = await this.projectRepository.delete(projectId)
        if (!deleted) {
            throw CustomError.internalServer('Error deleting project')
        }

        return true
    }

    async countUserProjects(userId: string): Promise<number> {
        return await this.projectRepository.countByUser(userId)
    }
}
