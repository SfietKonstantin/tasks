import { Action } from "redux"
import { project } from "../states"
import { ErrorAction } from "../../../common/actions/errors"
import { Project } from "../../../../common/types"
import { ProjectAction, PROJECT_DEFINE } from "../actions/project"

export const projectReducer = (state: Project = project, action: Action): Project => {
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
