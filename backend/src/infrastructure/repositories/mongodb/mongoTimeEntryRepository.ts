import {
	TimeEntry,
	TimeEntryEntity,
} from '../../../domain/entities/time-entry.entity'
import { TimeEntryRepository } from '../../../domain/repositories/timeEntryRepository.interface'
import {
	ITimeEntry,
	TimeEntry as TimeEntryModel,
} from '../../../data/mongodb/models/timeEntry.model'
import mongoose from 'mongoose'

export class MongoTimeEntryRepository implements TimeEntryRepository {
	async create(timeEntry: TimeEntryEntity): Promise<TimeEntry> {
		const newTimeEntry = new TimeEntryModel(timeEntry)
		await newTimeEntry.save()
		return {
			_id: newTimeEntry._id?.toString() || '',
			user: newTimeEntry.user.toString(),
			project: newTimeEntry.project.toString(),
			task: newTimeEntry.task?.toString(),
			tags: newTimeEntry.tags.map((tag) => tag.toString()),
			startTime: newTimeEntry.startTime,
			endTime: newTimeEntry.endTime,
			duration: newTimeEntry.duration,
			notes: newTimeEntry.notes,
			isRunning: newTimeEntry.isRunning,
			createdAt: newTimeEntry.createdAt,
			updatedAt: newTimeEntry.updatedAt,
		}
	}

	async findById(id: string): Promise<TimeEntry | null> {
		const timeEntry = await TimeEntryModel.findById(id)
		if (!timeEntry) return null

		return {
			_id: timeEntry._id?.toString() || '',
			user: timeEntry.user.toString(),
			project: timeEntry.project.toString(),
			task: timeEntry.task?.toString(),
			tags: timeEntry.tags.map((tag) => tag.toString()),
			startTime: timeEntry.startTime,
			endTime: timeEntry.endTime,
			duration: timeEntry.duration,
			notes: timeEntry.notes,
			isRunning: timeEntry.isRunning,
			createdAt: timeEntry.createdAt,
			updatedAt: timeEntry.updatedAt,
		}
	}

	async findRunningByUser(userId: string): Promise<TimeEntry | null> {
		// Find the most recent running time entry for this user
		const timeEntry = await TimeEntryModel.findOne({
			user: userId,
			isRunning: true
		}).sort({ startTime: -1 })

		if (!timeEntry) return null

		return {
			_id: timeEntry._id?.toString() || '',
			user: timeEntry.user.toString(),
			project: timeEntry.project.toString(),
			task: timeEntry.task?.toString(),
			tags: timeEntry.tags.map((tag) => tag.toString()),
			startTime: timeEntry.startTime,
			endTime: timeEntry.endTime,
			duration: timeEntry.duration,
			notes: timeEntry.notes,
			isRunning: timeEntry.isRunning,
			createdAt: timeEntry.createdAt,
			updatedAt: timeEntry.updatedAt,
		}
	}

	async update(
		id: string,
		timeEntry: Partial<TimeEntryEntity>,
	): Promise<TimeEntry | null> {
		const updatedTimeEntry = await TimeEntryModel.findByIdAndUpdate(
			id,
			{ ...timeEntry, updatedAt: new Date() },
			{ new: true },
		)

		if (!updatedTimeEntry) return null

		return {
			_id: updatedTimeEntry._id?.toString() || '',
			user: updatedTimeEntry.user.toString(),
			project: updatedTimeEntry.project.toString(),
			task: updatedTimeEntry.task?.toString(),
			tags: updatedTimeEntry.tags.map((tag) => tag.toString()),
			startTime: updatedTimeEntry.startTime,
			endTime: updatedTimeEntry.endTime,
			duration: updatedTimeEntry.duration,
			notes: updatedTimeEntry.notes,
			isRunning: updatedTimeEntry.isRunning,
			createdAt: updatedTimeEntry.createdAt,
			updatedAt: updatedTimeEntry.updatedAt,
		}
	}

	async delete(id: string): Promise<boolean> {
		try {
			const result = await TimeEntryModel.findByIdAndDelete(id)
			if (!result) {
				console.error(`Time entry with id ${id} not found for deletion`)
				return false
			}
			console.log(`Successfully deleted time entry with id ${id}`)
			return true
		} catch (error) {
			console.error(`Error deleting time entry with id ${id}:`, error)
			return false
		}
	}

	async listByUser(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<TimeEntry[]> {
		const skip = (page - 1) * limit
		const timeEntries = await TimeEntryModel.find({ user: userId })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })

		return timeEntries.map((entry) => ({
			_id: entry._id?.toString() || '',
			user: entry.user.toString(),
			project: entry.project.toString(),
			task: entry.task?.toString(),
			tags: entry.tags.map((tag) => tag.toString()),
			startTime: entry.startTime,
			endTime: entry.endTime,
			duration: entry.duration,
			notes: entry.notes,
			isRunning: entry.isRunning,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		}))
	}

	async listByProject(
		projectId: string,
		page = 1,
		limit = 10,
	): Promise<TimeEntry[]> {
		const skip = (page - 1) * limit
		const timeEntries = await TimeEntryModel.find({ project: projectId })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })

		return timeEntries.map((entry) => ({
			_id: entry._id?.toString() || '',
			user: entry.user.toString(),
			project: entry.project.toString(),
			task: entry.task?.toString(),
			tags: entry.tags.map((tag) => tag.toString()),
			startTime: entry.startTime,
			endTime: entry.endTime,
			duration: entry.duration,
			notes: entry.notes,
			isRunning: entry.isRunning,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		}))
	}

	async listByTask(
		taskId: string,
		page = 1,
		limit = 10,
	): Promise<TimeEntry[]> {
		const skip = (page - 1) * limit
		const timeEntries = await TimeEntryModel.find({ task: taskId })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })

		return timeEntries.map((entry) => ({
			_id: entry._id?.toString() || '',
			user: entry.user.toString(),
			project: entry.project.toString(),
			task: entry.task?.toString(),
			tags: entry.tags.map((tag) => tag.toString()),
			startTime: entry.startTime,
			endTime: entry.endTime,
			duration: entry.duration,
			notes: entry.notes,
			isRunning: entry.isRunning,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		}))
	}

	async findByCriteria(
		criteria: Partial<TimeEntryEntity>,
	): Promise<TimeEntry[]> {
		const timeEntries = await TimeEntryModel.find(criteria)
		return timeEntries.map((entry) => ({
			_id: entry._id?.toString() || '',
			user: entry.user.toString(),
			project: entry.project.toString(),
			task: entry.task?.toString(),
			tags: entry.tags.map((tag) => tag.toString()),
			startTime: entry.startTime,
			endTime: entry.endTime,
			duration: entry.duration,
			notes: entry.notes,
			isRunning: entry.isRunning,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		}))
	}

	async countByUser(userId: string): Promise<number> {
		return await TimeEntryModel.countDocuments({ user: userId })
	}

	async countByProject(projectId: string): Promise<number> {
		return await TimeEntryModel.countDocuments({ project: projectId })
	}

	async countByTask(taskId: string): Promise<number> {
		return await TimeEntryModel.countDocuments({ task: taskId })
	}

	async listByDateRange(
		userId: string,
		startDate: Date,
		endDate: Date,
		page = 1,
		limit = 10,
	): Promise<TimeEntry[]> {
		const skip = (page - 1) * limit
		const timeEntries = await TimeEntryModel.find({
			user: userId,
			startTime: { $gte: startDate, $lte: endDate },
		})
			.skip(skip)
			.limit(limit)
			.sort({ startTime: -1 })

		return timeEntries.map((entry) => ({
			_id: entry._id?.toString() || '',
			user: entry.user.toString(),
			project: entry.project.toString(),
			task: entry.task?.toString(),
			tags: entry.tags.map((tag) => tag.toString()),
			startTime: entry.startTime,
			endTime: entry.endTime,
			duration: entry.duration,
			notes: entry.notes,
			isRunning: entry.isRunning,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		}))
	}

	async deleteAllByUserId(userId: string): Promise<boolean> {
		try {
			await TimeEntryModel.deleteMany({ user: userId })
			return true
		} catch (error) {
			console.error('Error deleting all time entries for user:', error)
			return false
		}
	}
}
