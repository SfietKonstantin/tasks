import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project } from "../../../../common/types"

export const PROJECT_DEFINE = "PROJECT_DEFINE"
export const PROJECT_REQUEST_ADD = "PROJECT_REQUEST_ADD"
export const PROJECT_RECEIVE_ADD = "PROJECT_RECEIVE_ADD"

export interface ProjectAction extends Action {
    type: string,
    identifier: string,
    name: string,
    description: string
}

export function defineProject(identifier: string, name: string, description: string) : ProjectAction {
    return {
        type: PROJECT_DEFINE,
        identifier,
        name,
        description
    }
}

function requestAddProject() : Action {
    return {
        type: PROJECT_REQUEST_ADD
    }
}

function receiveAddProject() : Action {
    return {
        type: PROJECT_RECEIVE_ADD
    }
}

export const addProject = (project: Project) => {
    return function(dispatch: Dispatch<State>) {
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