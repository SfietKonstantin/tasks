import { Action, Dispatch } from "redux"
import "whatwg-fetch"
import { State } from "../types"
import { ErrorAction, processError } from "../../common/actions/error"
import { Project } from "../../../common/types"
import { createProject } from "../../../common/apitypes"

export const PROJECT_REQUEST = "PROJECT_REQUEST"
export const PROJECT_RECEIVE = "PROJECT_RECEIVE"
export const PROJECT_RECEIVE_FAILURE = "PROJECT_RECEIVE_FAILURE"

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

const receiveFailureProject = (): Action => {
    return {
        type: PROJECT_RECEIVE_FAILURE
    }
}

export const fetchProject = (projectIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestProject(projectIdentifier))
        return fetch("/api/project/" + projectIdentifier).then((response: Response) => {
            return processError(response).then(() => {
                return response.json()
            }).then((result: any) => {
                dispatch(receiveProject(projectIdentifier, createProject(result)))
            }).catch((error) => {
                dispatch(receiveFailureProject())
            })
        })
    }
}
