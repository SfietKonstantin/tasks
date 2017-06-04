import * as winston from "winston"
import {Request, Response, NextFunction, RequestHandler} from "express"
import {RequestError} from "../error/request"

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

export interface FeatureRequest extends Request {
    featureIdentifier: string
}

export const getFeatureIdentifier = (featureIdentifier: any): string => {
    if (typeof featureIdentifier !== "string") {
        winston.error(`featureIdentifier must be a string, not ${featureIdentifier}`)
        throw new RequestError(404, `Feature "${featureIdentifier}" not found`)
    }
    return featureIdentifier
}
