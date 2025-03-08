import { Tag, TagEntity } from '../entities/tag.entity'

export interface TagRepository {
    create(tag: TagEntity): Promise<Tag>

    findById(id: string): Promise<Tag | null>

    update(id: string, tag: Partial<TagEntity>): Promise<Tag | null>

    delete(id: string): Promise<boolean>

    listByUser(userId: string, page?: number, limit?: number): Promise<Tag[]>

    findByCriteria(criteria: Partial<TagEntity>): Promise<Tag[]>

    countByUser(userId: string): Promise<number>
}
