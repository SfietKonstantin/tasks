import { Action } from "redux"
import { ProjectState } from "../types"
import { Project } from "../../../common/types"
import { ProjectAction, PROJECT_REQUEST, PROJECT_RECEIVE } from "../actions/project"

const initialState: ProjectState = {
    isFetching: false,
    project: null
}

export const projectReducer = (state: ProjectState = initialState, action: Action): ProjectState => {
    switch (action.type) {
        case PROJECT_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case PROJECT_RECEIVE:
        const projectAction = action as ProjectAction
            return Object.assign({}, state, { isFetching: false, project: projectAction.project })
        default:
            return state
    }
}
