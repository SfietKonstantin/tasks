import {Request, Response, NextFunction, RequestHandler} from "express"
import {RequestError} from "../../error/requesterror"

const handleError = (error: Error, res: Response) => {
    if (error instanceof RequestError) {
        res.status(error.status).json(error.json)
    } else {
        res.sendStatus(500)
    }
}

export const asParameterHandler = (callback: (req: Request) => void): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            callback(req)
            next()
        } catch (error) {
            handleError(error, res)
        }
    }
}

export const asRoute = <T>(callback: (req: Request) => Promise<T>): RequestHandler => {
    return (req: Request, res: Response) => {
        callback(req).then((returned: T) => {
            res.json(returned)
        }).catch((error) => {
            handleError(error, res)
        })
    }
}
