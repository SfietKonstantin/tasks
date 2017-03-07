import * as winston from "winston"
import {Request, Response, NextFunction, RequestHandler} from "express"
import {RequestError} from "../error/requesterror"

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

export interface ProjectRequest extends Request {
    projectIdentifier: string
}

export interface TaskRequest extends ProjectRequest {
    taskIdentifier: string
}

export const getProjectIdentifier = (projectIdentifier: any): string => {
    if (typeof projectIdentifier !== "string") {
        winston.error(`projectIdentifier must be a string, not ${projectIdentifier}`)
        throw new RequestError(404, `Project "${projectIdentifier}" not found`)
    }
    return projectIdentifier
}

export const getTaskIdentifier = (taskIdentifier: any): string => {
    if (typeof taskIdentifier !== "string") {
        winston.error(`taskIdentifier must be a string, not ${taskIdentifier}`)
        throw new RequestError(404, `Task "${taskIdentifier}" not found`)
    }
    return taskIdentifier
}
