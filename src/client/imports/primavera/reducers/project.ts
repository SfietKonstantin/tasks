import { Action } from "redux"
import { ErrorAction } from "../../../common/actions/errors"
import { Project } from "../../../../common/types"
import { ProjectAction, PROJECT_DEFINE } from "../actions/project"

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
                identifier: projectAction.identifier,
                name: projectAction.name,
                description: projectAction.description
            }
        default:
            return state
    }
}
