import { Request, Response, NextFunction } from 'express'
import { JwtAdapter } from '../../config'
import '../../domain/types/request-extension'

interface JwtPayload {
    id: string
}

export const validateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authorization = req.header('Authorization')

        if (!authorization) {
            console.log('No token provided')
            res.status(401).json({ error: 'No token provided' })
            return
        }

        if (!authorization.startsWith('Bearer ')) {
            console.log('Invalid token format')
            res.status(401).json({ error: 'Invalid token format' })
            return
        }

        const token = authorization.split(' ')[1]
        console.log('Validating token...')

        const payload = await JwtAdapter.validateToken<JwtPayload>(token)

        if (!payload) {
            console.log('Invalid token')
            res.status(401).json({ error: 'Invalid token' })
            return
        }

        console.log('Token validated, user ID:', payload.id)
        req.user = { id: payload.id }
        next()
    } catch (error) {
        console.log('Authorization error:', error)
        res.status(401).json({ error: 'Unauthorized' })
    }
}
