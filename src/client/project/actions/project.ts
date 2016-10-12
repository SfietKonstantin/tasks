import { Action, Dispatch } from "redux"
import "whatwg-fetch"
import { State } from "../types"
import { Project } from "../../../common/types"

export const PROJECT_REQUEST = "PROJECT_REQUEST"
export const PROJECT_RECEIVE = "PROJECT_RECEIVE"

export interface ProjectAction extends Action {
    type: string,
    identifier: string
    project: Project
}

const requestProject = (identifier: string): Action => {
    return {
        type: PROJECT_REQUEST
    }
}

const receiveProject = (identifier: string, project: Project): ProjectAction => {
    return {
        type: PROJECT_RECEIVE,
        identifier,
        project
    }
}

export const fetchProject = (identifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestProject(identifier))
        return fetch("/api/project/" + identifier).then((response: Response) => {
            return response.json()
        }).then((project: Project) => {
            dispatch(receiveProject(identifier, project))
        })
    }
}
