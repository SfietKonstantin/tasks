import { Action, Dispatch } from "redux"
import "whatwg-fetch"
import { State } from "../types"
import { Project } from "../../../common/types"

export const PROJECT_REQUEST = "PROJECT_REQUEST"
export const PROJECT_RECEIVE = "PROJECT_RECEIVE"

export interface ProjectAction extends Action {
    type: string,
    projectIdentifier: string
    project: Project
}

const requestProject = (projectIdentifier: string): Action => {
    return {
        type: PROJECT_REQUEST
    }
}

const receiveProject = (projectIdentifier: string, project: Project): ProjectAction => {
    return {
        type: PROJECT_RECEIVE,
        projectIdentifier,
        project
    }
}

export const fetchProject = (projectIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestProject(projectIdentifier))
        return fetch("/api/project/" + projectIdentifier).then((response: Response) => {
            return response.json()
        }).then((project: Project) => {
            dispatch(receiveProject(projectIdentifier, project))
        })
    }
}
