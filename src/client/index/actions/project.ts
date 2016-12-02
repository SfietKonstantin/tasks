import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project } from "../../../common/types"

export const PROJECTS_REQUEST = "PROJECTS_REQUEST"
export const PROJECTS_RECEIVE = "PROJECTS_RECEIVE"

export interface ProjectsAction extends Action {
    type: string,
    projects: Array<Project>
}

const requestProjects = (): Action => {
    return {
        type: PROJECTS_REQUEST
    }
}

const receiveProjects = (projects: Array<Project>): ProjectsAction => {
    return {
        type: PROJECTS_RECEIVE,
        projects
    }
}

interface Results {
    projects: Array<Project>
}

export const fetchProjects = () => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestProjects())
        return fetch("/api/project/list").then((response: Response) => {
            return response.json()
        }).then((results: Results) => {
            dispatch(receiveProjects(results.projects))
        })
    }
}
