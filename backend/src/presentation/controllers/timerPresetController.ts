import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { TimerPresetService } from '../../domain/services/timerPreset/timerPresetService'
import { CreateTimerPresetDTO, UpdateTimerPresetDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class TimerPresetController extends BaseController {
    constructor(private readonly timerPresetService: TimerPresetService) {
        super()
    }

    public createTimerPreset = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const [error, createTimerPresetDto] = CreateTimerPresetDTO.create(
                req.body
            )
            if (error) return res.status(400).json({ error })

            const timerPreset = await this.timerPresetService.createTimerPreset(
                userId,
                createTimerPresetDto!
            )
            return this.handleSuccess(res, timerPreset, 201)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public getTimerPresetById = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            const timerPreset =
                await this.timerPresetService.getTimerPresetById(userId, id)
            return this.handleSuccess(res, timerPreset)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public updateTimerPreset = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            const [error, updateTimerPresetDto] = UpdateTimerPresetDTO.create(
                req.body
            )
            if (error) return res.status(400).json({ error })

            const updatedTimerPreset =
                await this.timerPresetService.updateTimerPreset(
                    userId,
                    id,
                    updateTimerPresetDto!
                )
            return this.handleSuccess(res, updatedTimerPreset)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public deleteTimerPreset = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            await this.timerPresetService.deleteTimerPreset(userId, id)
            return this.handleSuccess(res, {
                message: 'Timer preset deleted successfully',
            })
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public listTimerPresets = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const page = req.query.page
                ? parseInt(req.query.page as string)
                : undefined
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined

            const timerPresets = await this.timerPresetService.listTimerPresets(
                userId,
                page,
                limit
            )
            return this.handleSuccess(res, timerPresets)
        } catch (error) {
            return this.handleError(error, res)
        }
    }
}
