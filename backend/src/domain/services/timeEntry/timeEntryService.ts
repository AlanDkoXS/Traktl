import { TimeEntryRepository } from '../../repositories/timeEntryRepository.interface'
import { TimeEntry, TimeEntryEntity } from '../../entities/time-entry.entity'
import { CreateTimeEntryDTO } from '../../dtos/timeEntry/create-time-entry.dto'
import { UpdateTimeEntryDTO } from '../../dtos/timeEntry/update-time-entry.dto'
import { CustomError } from '../../errors/custom.errors'

export class TimeEntryService {
	constructor(private readonly timeEntryRepository: TimeEntryRepository) {}

	async createTimeEntry(
		userId: string,
		createTimeEntryDto: CreateTimeEntryDTO,
	): Promise<TimeEntry> {
		const duration =
			createTimeEntryDto.duration ||
			(createTimeEntryDto.endTime && createTimeEntryDto.startTime
				? createTimeEntryDto.endTime.getTime() -
					createTimeEntryDto.startTime.getTime()
				: 0)

		const timeEntryEntity: TimeEntryEntity = {
			user: userId,
			project: createTimeEntryDto.project,
			task: createTimeEntryDto.task,
			tags: createTimeEntryDto.tags || [],
			startTime: createTimeEntryDto.startTime,
			endTime: createTimeEntryDto.endTime,
			duration: duration,
			notes: createTimeEntryDto.notes || '',
			isRunning: createTimeEntryDto.isRunning || false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		return await this.timeEntryRepository.create(timeEntryEntity)
	}

	async startTimeEntry(
		userId: string,
		createTimeEntryDto: CreateTimeEntryDTO,
	): Promise<TimeEntry> {
		// Ensure we set the correct start parameters
		const startTime = new Date();
		
		const timeEntryData: CreateTimeEntryDTO = {
			...createTimeEntryDto,
			startTime,
			endTime: undefined, // Will be set when stopped
			duration: 0, // Will be calculated when stopped
			isRunning: true,
		};
		
		return this.createTimeEntry(userId, timeEntryData);
	}
	
	async stopTimeEntry(
		userId: string,
		timeEntryId: string,
		updateData?: Partial<UpdateTimeEntryDTO>,
	): Promise<TimeEntry> {
		const existingTimeEntry = await this.timeEntryRepository.findById(timeEntryId);
		
		if (!existingTimeEntry || existingTimeEntry.user.toString() !== userId) {
			throw CustomError.notFound('Time entry not found');
		}
		
		if (!existingTimeEntry.isRunning) {
			throw CustomError.badRequest('Time entry is not running');
		}
		
		const endTime = new Date();
		const startTime = new Date(existingTimeEntry.startTime);
		const duration = endTime.getTime() - startTime.getTime();
		
		const updateTimeEntryDto: UpdateTimeEntryDTO = {
			...updateData,
			endTime,
			duration,
			isRunning: false,
			updatedAt: new Date(),
		};
		
		return this.updateTimeEntry(userId, timeEntryId, updateTimeEntryDto);
	}

	async updateTimeEntry(
		userId: string,
		timeEntryId: string,
		updateTimeEntryDto: UpdateTimeEntryDTO,
	): Promise<TimeEntry> {
		const existingTimeEntry =
			await this.timeEntryRepository.findById(timeEntryId)
		if (
			!existingTimeEntry ||
			existingTimeEntry.user.toString() !== userId
		) {
			throw CustomError.notFound('Time entry not found')
		}

		const duration =
			updateTimeEntryDto.duration !== undefined
				? updateTimeEntryDto.duration
				: (updateTimeEntryDto.endTime && updateTimeEntryDto.startTime
					? updateTimeEntryDto.endTime.getTime() -
						updateTimeEntryDto.startTime.getTime()
					: existingTimeEntry.duration);

		const updatedTimeEntry = await this.timeEntryRepository.update(
			timeEntryId,
			{
				...updateTimeEntryDto,
				duration,
				updatedAt: new Date(),
			},
		)

		if (!updatedTimeEntry) {
			throw CustomError.internalServer('Error updating time entry')
		}

		return updatedTimeEntry
	}

	async getTimeEntryById(
		userId: string,
		timeEntryId: string,
	): Promise<TimeEntry> {
		const timeEntry = await this.timeEntryRepository.findById(timeEntryId)

		if (!timeEntry || timeEntry.user.toString() !== userId) {
			throw CustomError.notFound('Time entry not found')
		}

		return timeEntry
	}
	
	async getRunningTimeEntry(userId: string): Promise<TimeEntry | null> {
		return await this.timeEntryRepository.findRunningByUser(userId);
	}

	async listTimeEntries(
		userId: string,
		page?: number,
		limit?: number,
	): Promise<TimeEntry[]> {
		return await this.timeEntryRepository.listByUser(userId, page, limit)
	}

	async listTimeEntriesByProject(
		projectId: string,
		page?: number,
		limit?: number,
	): Promise<TimeEntry[]> {
		return await this.timeEntryRepository.listByProject(
			projectId,
			page,
			limit,
		)
	}

	async listTimeEntriesByTask(
		taskId: string,
		page?: number,
		limit?: number,
	): Promise<TimeEntry[]> {
		return await this.timeEntryRepository.listByTask(taskId, page, limit)
	}

	async listTimeEntriesByDateRange(
		userId: string,
		startDate: Date,
		endDate: Date,
		page?: number,
		limit?: number,
	): Promise<TimeEntry[]> {
		return await this.timeEntryRepository.listByDateRange(
			userId,
			startDate,
			endDate,
			page,
			limit,
		)
	}

	async deleteTimeEntry(
		userId: string,
		timeEntryId: string,
	): Promise<boolean> {
		const existingTimeEntry =
			await this.timeEntryRepository.findById(timeEntryId)
		if (
			!existingTimeEntry ||
			existingTimeEntry.user.toString() !== userId
		) {
			throw CustomError.notFound('Time entry not found')
		}

		const deleted = await this.timeEntryRepository.delete(timeEntryId)
		if (!deleted) {
			throw CustomError.internalServer('Error deleting time entry')
		}

		return true
	}

	async countUserTimeEntries(userId: string): Promise<number> {
		return await this.timeEntryRepository.countByUser(userId)
	}

	async countProjectTimeEntries(projectId: string): Promise<number> {
		return await this.timeEntryRepository.countByProject(projectId)
	}

	async countTaskTimeEntries(taskId: string): Promise<number> {
		return await this.timeEntryRepository.countByTask(taskId)
	}
}
