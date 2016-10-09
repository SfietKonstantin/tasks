import { Action } from "redux"
import { Project } from "../../../../common/types"
import { ProjectAction, PROJECT_DEFINE } from "../actions/project"


const initialState: Project = {
    identifier: "",
    name: "",
    description: ""
}

export const projectReducer = (state: Project = initialState, action: ProjectAction) : Project => {
    switch (action.type) {
        case PROJECT_DEFINE:
            return { 
                identifier: action.identifier,
                name: action.name,
                description: action.description
            }
        default:
            return state
    }
} 