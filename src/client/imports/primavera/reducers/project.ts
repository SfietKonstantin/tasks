import { Action } from "redux"
import { ErrorAction } from "../../../common/actions/errors"
import { Project } from "../../../../common/types"
import { ProjectState } from "../types"
import {
    ProjectAction, PROJECT_DEFINE, PROJECT_REQUEST_ADD, PROJECT_RECEIVE_ADD, PROJECT_RECEIVE_ADD_FAILURE
} from "../actions/project"

const initialState: ProjectState = {
    project: {
        identifier: "",
        name: "",
        description: ""
    },
    error: null
}

export const projectReducer = (state: ProjectState = initialState, action: Action): ProjectState => {
    switch (action.type) {
        case PROJECT_DEFINE:
            const projectAction = action as ProjectAction
            return Object.assign({}, state, {
                project: {
                    identifier: projectAction.identifier,
                    name: projectAction.name,
                    description: projectAction.description
                }
            })
        case PROJECT_REQUEST_ADD:
            return state
        case PROJECT_RECEIVE_ADD:
            return state
        case PROJECT_RECEIVE_ADD_FAILURE:
            const errorAction = action as ErrorAction
            return Object.assign({}, state, { error: errorAction.message })
        default:
            return state
    }
}
