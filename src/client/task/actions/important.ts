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

const requestImportant = (projectIdentifier: string, taskIdentifier: string): ImportantAction => {
    return {
        type: TASK_IMPORTANT_REQUEST,
        projectIdentifier,
        taskIdentifier
    }
}

const receiveImportant = (projectIdentifier: string, taskIdentifier: string, important: boolean): ImportantAction => {
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
        dispatch(requestImportant(projectIdentifier, taskIdentifier))
        const url = "/api/project/" + projectIdentifier + "/task/" + taskIdentifier + "/important"
        return fetch(url).then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(projectIdentifier, taskIdentifier, result.important))
        })
    }
}

const requestUpdateImportant = (projectIdentifier: string, taskIdentifier: string,
                                important: boolean): ImportantAction => {
    return {
        type: TASK_IMPORTANT_REQUEST_UPDATE,
        projectIdentifier,
        taskIdentifier,
        important
    }
}

export const updateImportant = (projectIdentifier: string, taskIdentifier: string, important: boolean) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestUpdateImportant(projectIdentifier, taskIdentifier, important))
        const url = "/api/project/" + projectIdentifier + "/task/" + taskIdentifier + "/important"
        const method = important ? "PUT" : "DELETE"
        return fetch(url, {method}).then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(projectIdentifier, taskIdentifier, result.important))
        })
    }
}
