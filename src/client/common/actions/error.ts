import { Action } from "redux"

export interface ErrorAction extends Action {
    message: string
}

export const processError = (response: Response): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (response.ok) {
            resolve()
        } else {
            response.json().then((result: any) => {
                if (result.hasOwnProperty("error")) {
                    reject(new Error(result["error"] as string))
                } else {
                    reject(new Error("Unknown error"))
                }
            }).catch((error) => {
                reject(new Error("Unknown error"))
            })
        }
    })
}
