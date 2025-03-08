import { Task, TaskEntity } from '../../../domain/entities/task.entity';
import { TaskRepository } from '../../../domain/repositories/taskRepository.interface';
import { ITask, Task as TaskModel } from '../../../data/mongodb/models/task.model';
import mongoose from 'mongoose';

export class MongoTaskRepository implements TaskRepository {
    async create(task: TaskEntity): Promise<Task> {
        const newTask = new TaskModel(task);
        await newTask.save();
        return {
            _id: newTask._id?.toString() || '',
            name: newTask.name,
            description: newTask.description,
            project: newTask.project.toString(),
            status: newTask.status,
            user: newTask.user.toString(),
            createdAt: newTask.createdAt,
            updatedAt: newTask.updatedAt
        };
    }

    async findById(id: string): Promise<Task | null> {
        const task = await TaskModel.findById(id);
        if (!task) return null;

        return {
            _id: task._id?.toString() || '',
            name: task.name,
            description: task.description,
            project: task.project.toString(),
            status: task.status,
            user: task.user.toString(),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };
    }

    async update(id: string, task: Partial<TaskEntity>): Promise<Task | null> {
        const updatedTask = await TaskModel.findByIdAndUpdate(
            id,
            { ...task, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedTask) return null;

        return {
            _id: updatedTask._id?.toString() || '',
            name: updatedTask.name,
            description: updatedTask.description,
            project: updatedTask.project.toString(),
            status: updatedTask.status,
            user: updatedTask.user.toString(),
            createdAt: updatedTask.createdAt,
            updatedAt: updatedTask.updatedAt
        };
    }

    async delete(id: string): Promise<boolean> {
        const result = await TaskModel.findByIdAndDelete(id);
        return !!result;
    }

    async listByUser(userId: string, page = 1, limit = 10): Promise<Task[]> {
        const skip = (page - 1) * limit;
        const tasks = await TaskModel.find({ user: userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return tasks.map(task => ({
            _id: task._id?.toString() || '',
            name: task.name,
            description: task.description,
            project: task.project.toString(),
            status: task.status,
            user: task.user.toString(),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        }));
    }

    async listByProject(projectId: string, page = 1, limit = 10): Promise<Task[]> {
        const skip = (page - 1) * limit;
        const tasks = await TaskModel.find({ project: projectId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return tasks.map(task => ({
            _id: task._id?.toString() || '',
            name: task.name,
            description: task.description,
            project: task.project.toString(),
            status: task.status,
            user: task.user.toString(),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        }));
    }

    async findByCriteria(criteria: Partial<TaskEntity>): Promise<Task[]> {
        const tasks = await TaskModel.find(criteria);
        return tasks.map(task => ({
            _id: task._id?.toString() || '',
            name: task.name,
            description: task.description,
            project: task.project.toString(),
            status: task.status,
            user: task.user.toString(),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        }));
    }

    async countByUser(userId: string): Promise<number> {
        return await TaskModel.countDocuments({ user: userId });
    }

    async countByProject(projectId: string): Promise<number> {
        return await TaskModel.countDocuments({ project: projectId });
    }
}
