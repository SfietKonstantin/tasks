import { Action, Dispatch } from "redux"
import { State } from "../types"
import { ErrorAction, processError } from "../../../common/actions/errors"
import { Project } from "../../../../common/types"

export const PROJECT_DEFINE = "PROJECT_DEFINE"
export const PROJECT_REQUEST_ADD = "PROJECT_REQUEST_ADD"
export const PROJECT_RECEIVE_ADD = "PROJECT_RECEIVE_ADD"
export const PROJECT_RECEIVE_ADD_FAILURE = "PROJECT_RECEIVE_ADD_FAILURE"

export interface ProjectAction extends Action {
    type: string,
    identifier: string,
    name: string,
    description: string
}

export const defineProject = (identifier: string, name: string, description: string): ProjectAction => {
    return {
        type: PROJECT_DEFINE,
        identifier,
        name,
        description
    }
}

export const requestAddProject = (): Action => {
    return {
        type: PROJECT_REQUEST_ADD
    }
}

export const receiveAddProject = (): Action => {
    return {
        type: PROJECT_RECEIVE_ADD
    }
}

export const receiveAddFailureProject = (message: string): ErrorAction => {
    return {
        type: PROJECT_RECEIVE_ADD_FAILURE,
        message
    }
}

export const addProject = (project: Project) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestAddProject())
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project
            })
        }
        return fetch("/api/project", requestInit).then((response: Response) => {
            return processError(response)
        }).then(() => {
            dispatch(receiveAddProject())
        }).catch((error: Error) => {
            dispatch(receiveAddFailureProject(error.message))
        })
    }
}
