import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project } from "../../../../common/types"

export const PROJECT_DEFINE = "PROJECT_DEFINE"
export const PROJECT_REQUEST_ADD = "PROJECT_REQUEST_ADD"
export const PROJECT_RECEIVE_ADD = "PROJECT_RECEIVE_ADD"

export interface ProjectAction extends Action {
    type: string,
    projectIdentifier: string,
    name: string,
    description: string
}

export const defineProject = (projectIdentifier: string, name: string, description: string): ProjectAction => {
    return {
        type: PROJECT_DEFINE,
        projectIdentifier,
        name,
        description
    }
}

const requestAddProject = (): Action => {
    return {
        type: PROJECT_REQUEST_ADD
    }
}

const receiveAddProject = (): Action => {
    return {
        type: PROJECT_RECEIVE_ADD
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
        return fetch("/api/project", requestInit).then(() => {
            dispatch(receiveAddProject())
        })
    }
}
