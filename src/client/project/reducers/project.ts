import { Action } from "redux"
import { ProjectState } from "../types"
import { Project } from "../../../common/types"
import { ProjectAction, PROJECT_REQUEST, PROJECT_RECEIVE, PROJECT_RECEIVE_FAILURE } from "../actions/project"
import { project } from "../states"
import { copyAssign } from "../../common/assign"

export const projectReducer = (state: ProjectState = project, action: Action): ProjectState => {
    switch (action.type) {
        case PROJECT_REQUEST:
            return copyAssign(state, { isFetching: true })
        case PROJECT_RECEIVE:
        const projectAction = action as ProjectAction
            return copyAssign(state, { isFetching: false, project: projectAction.project })
        case PROJECT_RECEIVE_FAILURE:
            return copyAssign(state, { isFetching: false })
        default:
            return state
    }
}
