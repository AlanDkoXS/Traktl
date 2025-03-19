import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { TimeEntryService } from '../../domain/services/timeEntry/timeEntryService'
import { CreateTimeEntryDTO, UpdateTimeEntryDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class TimeEntryController extends BaseController {
	constructor(private readonly timeEntryService: TimeEntryService) {
		super()
	}

	public createTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			const [error, createTimeEntryDto] = CreateTimeEntryDTO.create(
				req.body,
			)
			if (error) return res.status(400).json({ error })
			
			const timeEntry = await this.timeEntryService.createTimeEntry(
				userId,
				createTimeEntryDto!,
			)
			
			return this.handleSuccess(res, timeEntry, 201)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public startTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			// Check if there's already a running time entry
			const runningEntry = await this.timeEntryService.getRunningTimeEntry(userId)
			if (runningEntry) {
				return res.status(400).json({ 
					error: 'There is already a running time entry. Please stop it before starting a new one.' 
				})
			}
			
			const [error, createTimeEntryDto] = CreateTimeEntryDTO.create(
				req.body,
			)
			if (error) return res.status(400).json({ error })
			
			const timeEntry = await this.timeEntryService.startTimeEntry(
				userId,
				createTimeEntryDto!,
			)
			
			return this.handleSuccess(res, timeEntry, 201)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public stopTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			// Get the running time entry
			const runningEntry = await this.timeEntryService.getRunningTimeEntry(userId)
			if (!runningEntry) {
				return res.status(400).json({ error: 'No running time entry found.' })
			}
			
			// Optional update data from request body
			const [error, updateData] = UpdateTimeEntryDTO.create(req.body)
			
			const stoppedEntry = await this.timeEntryService.stopTimeEntry(
				userId,
				runningEntry._id,
				error ? undefined : updateData
			)
			
			return this.handleSuccess(res, stoppedEntry)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getRunningTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			const runningEntry = await this.timeEntryService.getRunningTimeEntry(userId)
			
			if (!runningEntry) {
				return res.status(404).json({ message: 'No running time entry found' })
			}
			
			return this.handleSuccess(res, runningEntry)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public getTimeEntryById = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			const { id } = req.params
			const timeEntry = await this.timeEntryService.getTimeEntryById(
				userId,
				id,
			)
			
			return this.handleSuccess(res, timeEntry)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public updateTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			const { id } = req.params
			const [error, updateTimeEntryDto] = UpdateTimeEntryDTO.create(
				req.body,
			)
			if (error) return res.status(400).json({ error })
			
			const updatedTimeEntry =
				await this.timeEntryService.updateTimeEntry(
					userId,
					id,
					updateTimeEntryDto!,
				)
			
			return this.handleSuccess(res, updatedTimeEntry)
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public deleteTimeEntry = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id
			if (!userId) return res.status(401).json({ error: 'Unauthorized' })
			
			const { id } = req.params
			await this.timeEntryService.deleteTimeEntry(userId, id)
			
			return this.handleSuccess(res, {
				message: 'Time entry deleted successfully',
			})
		} catch (error) {
			return this.handleError(error, res)
		}
	}

	public listTimeEntries = async (req: Request, res: Response) => {
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
			const taskId = req.query.taskId as string | undefined
			const startDate = req.query.startDate
				? new Date(req.query.startDate as string)
				: undefined
			const endDate = req.query.endDate
				? new Date(req.query.endDate as string)
				: undefined
			
			let timeEntries
			if (projectId) {
				timeEntries =
					await this.timeEntryService.listTimeEntriesByProject(
						projectId,
						page,
						limit,
					)
			} else if (taskId) {
				timeEntries = await this.timeEntryService.listTimeEntriesByTask(
					taskId,
					page,
					limit,
				)
			} else if (startDate && endDate) {
				timeEntries =
					await this.timeEntryService.listTimeEntriesByDateRange(
						userId,
						startDate,
						endDate,
						page,
						limit,
					)
			} else {
				timeEntries = await this.timeEntryService.listTimeEntries(
					userId,
					page,
					limit,
				)
			}
			
			return this.handleSuccess(res, timeEntries)
		} catch (error) {
			return this.handleError(error, res)
		}
	}
}
