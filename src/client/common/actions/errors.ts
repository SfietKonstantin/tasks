import { Action } from "redux"

export interface ErrorAction extends Action {
    message: string
}

export const processError = (response: Response): Promise<string | null> => {
    return Promise.resolve().then(() => {
        if (response.ok) {
            return null
        }

        return response.json().then((result: any): string | null => {
            if (result.hasOwnProperty("error")) {
                return result["error"] as string
            } else {
                return "Unknown error"
            }
        })
    }).catch((error) => {
        return "Unknown error"
    })
}
