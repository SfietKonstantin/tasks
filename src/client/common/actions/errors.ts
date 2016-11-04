import { Action } from "redux"

export interface ErrorAction extends Action {
    message: string
}

export class ErrorResponseError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export const processError = (response: Response): Promise<any> => {
    return Promise.resolve().then(() => {
        if (response.status === 201) {
            return null
        }
        return response.json()
    }).then((result: any) => {
        if (response.ok) {
            return result
        } else {
            if (result.hasOwnProperty("error")) {
                throw new ErrorResponseError(result["error"] as string)
            } else {
                throw new ErrorResponseError("Unknown error")
            }
        }
    }).catch((error) => {
        if (error instanceof ErrorResponseError) {
            throw error
        } else {
            throw new ErrorResponseError("Unknown error")
        }
    })
}
