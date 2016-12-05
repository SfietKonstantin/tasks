import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project } from "../../../common/types"

export const TASK_IMPORTANT_REQUEST = "TASK_IMPORTANT_REQUEST"
export const TASK_IMPORTANT_RECEIVE = "TASK_IMPORTANT_RECEIVE"
export const TASK_IMPORTANT_REQUEST_UPDATE = "TASK_IMPORTANT_REQUEST_UPDATE"

export interface ImportantAction extends Action {
    type: string,
    projectIdentifier: string,
    taskIdentifier: string
    important?: boolean
}

export const requestImportant = (): Action => {
    return {
        type: TASK_IMPORTANT_REQUEST
    }
}

export const receiveImportant = (projectIdentifier: string, taskIdentifier: string,
                                 important: boolean): ImportantAction => {
    return {
        type: TASK_IMPORTANT_RECEIVE,
        projectIdentifier,
        taskIdentifier,
        important
    }
}

interface ImportantResult {
    important: boolean
}

export const fetchImportant = (projectIdentifier: string, taskIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestImportant())
        const url = "/api/project/" + projectIdentifier + "/task/" + taskIdentifier + "/important"
        return fetch(url).then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(projectIdentifier, taskIdentifier, result.important))
        })
    }
}

export const requestUpdateImportant = (): Action => {
    return {
        type: TASK_IMPORTANT_REQUEST_UPDATE
    }
}

export const updateImportant = (projectIdentifier: string, taskIdentifier: string, important: boolean) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestUpdateImportant())
        const url = "/api/project/" + projectIdentifier + "/task/" + taskIdentifier + "/important"
        const method = important ? "PUT" : "DELETE"
        return fetch(url, {method}).then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(projectIdentifier, taskIdentifier, result.important))
        })
    }
}
