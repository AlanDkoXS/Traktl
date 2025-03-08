import { TimeEntry, TimeEntryEntity } from '../entities/time-entry.entity'

export interface TimeEntryRepository {
    create(timeEntry: TimeEntryEntity): Promise<TimeEntry>

    findById(id: string): Promise<TimeEntry | null>

    update(
        id: string,
        timeEntry: Partial<TimeEntryEntity>
    ): Promise<TimeEntry | null>

    delete(id: string): Promise<boolean>

    listByUser(
        userId: string,
        page?: number,
        limit?: number
    ): Promise<TimeEntry[]>
    listByProject(
        projectId: string,
        page?: number,
        limit?: number
    ): Promise<TimeEntry[]>
    listByTask(
        taskId: string,
        page?: number,
        limit?: number
    ): Promise<TimeEntry[]>

    findByCriteria(criteria: Partial<TimeEntryEntity>): Promise<TimeEntry[]>

    countByUser(userId: string): Promise<number>
    countByProject(projectId: string): Promise<number>
    countByTask(taskId: string): Promise<number>

    listByDateRange(
        userId: string,
        startDate: Date,
        endDate: Date,
        page?: number,
        limit?: number
    ): Promise<TimeEntry[]>
}
