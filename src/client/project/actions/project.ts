import { Action, Dispatch } from "redux"
import { State } from "../types"
import { processError } from "../../common/actions/errors"
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

export const requestProject = (projectIdentifier: string): Action => {
    return {
        type: PROJECT_REQUEST
    }
}

export const receiveProject = (projectIdentifier: string, project: Project): ProjectAction => {
    return {
        type: PROJECT_RECEIVE,
        projectIdentifier,
        project
    }
}

export const receiveFailureProject = (): Action => {
    return {
        type: PROJECT_RECEIVE_FAILURE
    }
}

export const fetchProject = (projectIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestProject(projectIdentifier))
        return fetch("/api/project/" + projectIdentifier).then((response: Response) => {
            return processError(response)
        }).then((result: any) => {
            dispatch(receiveProject(projectIdentifier, createProject(result)))
        }).catch(() => {
            dispatch(receiveFailureProject())
        })
    }
}
