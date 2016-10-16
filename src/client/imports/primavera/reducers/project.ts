import { Action } from "redux"
import { Project } from "../../../../common/types"
import { ProjectAction, PROJECT_DEFINE, PROJECT_REQUEST_ADD, PROJECT_RECEIVE_ADD } from "../actions/project"

const initialState: Project = {
    identifier: "",
    name: "",
    description: ""
}

export const projectReducer = (state: Project = initialState, action: Action): Project => {
    switch (action.type) {
        case PROJECT_DEFINE:
            const projectAction = action as ProjectAction
            return {
                identifier: projectAction.projectIdentifier,
                name: projectAction.name,
                description: projectAction.description
            }
        case PROJECT_REQUEST_ADD:
            return state
        case PROJECT_RECEIVE_ADD:
            return state
        default:
            return state
    }
}
