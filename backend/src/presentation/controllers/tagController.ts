import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { TagService } from '../../domain/services/tag/tagService'
import { CreateTagDTO, UpdateTagDTO } from '../../domain/dtos'
import '../../domain/types/request-extension'

export class TagController extends BaseController {
    constructor(private readonly tagService: TagService) {
        super()
    }

    public createTag = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const [error, createTagDto] = CreateTagDTO.create(req.body)
            if (error) return res.status(400).json({ error })

            const tag = await this.tagService.createTag(userId, createTagDto!)
            return this.handleSuccess(res, tag, 201)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public getTagById = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            const tag = await this.tagService.getTagById(userId, id)
            return this.handleSuccess(res, tag)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public updateTag = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            const [error, updateTagDto] = UpdateTagDTO.create(req.body)
            if (error) return res.status(400).json({ error })

            const updatedTag = await this.tagService.updateTag(
                userId,
                id,
                updateTagDto!
            )
            return this.handleSuccess(res, updatedTag)
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public deleteTag = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const { id } = req.params
            await this.tagService.deleteTag(userId, id)
            return this.handleSuccess(res, {
                message: 'Tag deleted successfully',
            })
        } catch (error) {
            return this.handleError(error, res)
        }
    }

    public listTags = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            if (!userId) return res.status(401).json({ error: 'Unauthorized' })

            const page = req.query.page
                ? parseInt(req.query.page as string)
                : undefined
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined

            const tags = await this.tagService.listTags(userId, page, limit)
            return this.handleSuccess(res, tags)
        } catch (error) {
            return this.handleError(error, res)
        }
    }
}
