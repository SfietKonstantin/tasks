import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project } from "../../../common/types"

export const TASK_IMPORTANT_REQUEST = "TASK_IMPORTANT_REQUEST"
export const TASK_IMPORTANT_RECEIVE = "TASK_IMPORTANT_RECEIVE"
export const TASK_IMPORTANT_REQUEST_UPDATE = "TASK_IMPORTANT_REQUEST_UPDATE"

export interface ImportantAction extends Action {
    type: string,
    identifier: string
    important?: boolean
}

const requestImportant = (identifier: string): ImportantAction => {
    return {
        type: TASK_IMPORTANT_REQUEST,
        identifier
    }
}

const receiveImportant = (identifier: string, important: boolean): ImportantAction => {
    return {
        type: TASK_IMPORTANT_RECEIVE,
        identifier,
        important
    }
}

interface ImportantResult {
    important: boolean
}

export const fetchImportant = (identifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestImportant(identifier))
        return fetch("/api/task/" + identifier + "/important").then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(identifier, result.important))
        })
    }
}

const requestUpdateImportant = (identifier: string, important: boolean): ImportantAction => {
    return {
        type: TASK_IMPORTANT_REQUEST_UPDATE,
        identifier,
        important
    }
}

export const updateImportant = (identifier: string, important: boolean) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestUpdateImportant(identifier, important))
        const method = important ? "PUT" : "DELETE"
        return fetch("/api/task/" + identifier + "/important", {method}).then((response: Response) => {
            return response.json()
        }).then((result: ImportantResult) => {
            dispatch(receiveImportant(identifier, result.important))
        })
    }
}
