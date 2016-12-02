import { Action } from "redux"
import { ProjectState } from "../types"
import { Project } from "../../../common/types"
import { ProjectsAction, PROJECTS_REQUEST, PROJECTS_RECEIVE } from "../actions/project"
import { copyAssign } from "../../common/assign"

const initialState: ProjectState = {
    isFetching: false,
    projects: []
}

export const projectReducer = (state: ProjectState = initialState, action: Action): ProjectState => {
    switch (action.type) {
        case PROJECTS_REQUEST:
            return copyAssign(state, { isFetching: true })
        case PROJECTS_RECEIVE:
            const projectsAction = action as ProjectsAction
            return copyAssign(state, {
                isFetching: false,
                projects: projectsAction.projects
            })
        default:
            return state
    }
}
