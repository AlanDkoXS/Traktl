import { Request, Response, NextFunction } from 'express'

export const sanitizeLogsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const sanitizedRequestBody = { ...req.body }

    if (sanitizedRequestBody.password) {
        sanitizedRequestBody.password = '*****'
    }

    if (sanitizedRequestBody.email) {
        sanitizedRequestBody.email = sanitizedRequestBody.email.slice(0, 3) + '***' + sanitizedRequestBody.email.slice(sanitizedRequestBody.email.indexOf('@'))
    }

    console.log('Request body:', sanitizedRequestBody)

    next()
}
