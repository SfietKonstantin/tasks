import { Action, Dispatch } from "redux"
import { State } from "../types"
import { ErrorAction, processError } from "../../../common/actions/errors"
import { Project } from "../../../../common/types"

export const PROJECT_DEFINE = "PROJECT_DEFINE"

export interface ProjectAction extends Action {
    type: string,
    identifier: string,
    name: string,
    description: string
}

export const defineProject = (identifier: string, name: string, description: string): ProjectAction => {
    return {
        type: PROJECT_DEFINE,
        identifier,
        name,
        description
    }
}
