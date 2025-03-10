import { ProjectRepository } from '../../../domain/repositories/projectRepository.interface'
import {
    Project as ProjectEntity,
    ProjectEntity as ProjectDomain,
} from '../../../domain/entities/project.entity'
import { Project } from '../../../data/mongodb/models/project.model'

export class MongoProjectRepository implements ProjectRepository {
    async create(project: ProjectDomain): Promise<ProjectEntity> {
        const newProject = await Project.create(project)
        return this.mapToDomain(newProject)
    }

    async findById(id: string): Promise<ProjectEntity | null> {
        // Validate if the ID is valid
        if (!id || id === 'undefined') {
            return null;
        }

        try {
            const project = await Project.findById(id);
            return project ? this.mapToDomain(project) : null;
        } catch (error) {
            console.error('Error finding project by ID:', error);
            return null;
        }
    }

    async update(
        id: string,
        projectData: Partial<ProjectDomain>
    ): Promise<ProjectEntity | null> {
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { ...projectData, updatedAt: new Date() },
            { new: true }
        )
        return updatedProject ? this.mapToDomain(updatedProject) : null
    }

    async delete(id: string): Promise<boolean> {
        const result = await Project.findByIdAndDelete(id)
        return !!result
    }

    async listByUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<ProjectEntity[]> {
        const skip = (page - 1) * limit
        const projects = await Project.find({ user: userId })
            .skip(skip)
            .limit(limit)
        return projects.map((project) => this.mapToDomain(project))
    }

    async findByCriteria(
        criteria: Partial<ProjectDomain>
    ): Promise<ProjectEntity[]> {
        const projects = await Project.find(criteria)
        return projects.map((project) => this.mapToDomain(project))
    }

    async countByUser(userId: string): Promise<number> {
        return await Project.countDocuments({ user: userId })
    }

    private mapToDomain(project: any): ProjectEntity {
        return {
            _id: project._id.toString(),
            name: project.name,
            description: project.description,
            color: project.color,
            client: project.client?.toString(),
            status: project.status,
            user: project.user.toString(),
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        }
    }
}
