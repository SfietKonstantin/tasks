import { ProjectState } from "../types"
import { Project } from "../../../common/types"
import { ProjectAction, PROJECT_REQUEST, PROJECT_RECEIVE } from "../actions/project"

const defaultState: ProjectState = {
    isFetching: false,
    project: null
}

export const projectReducer = (state: ProjectState = defaultState, action: ProjectAction) : ProjectState => {
    switch (action.type) {
        case PROJECT_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case PROJECT_RECEIVE:
            return Object.assign({}, state, { isFetching: false, project: action.project })
        default:
            return state
    }
} 