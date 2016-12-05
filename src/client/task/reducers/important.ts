import { Action } from "redux"
import { ImportantState } from "../types"
import { Project } from "../../../common/types"
import {
    ImportantAction, TASK_IMPORTANT_REQUEST, TASK_IMPORTANT_RECEIVE, TASK_IMPORTANT_REQUEST_UPDATE
} from "../actions/important"
import { importantState } from "../states"
import { copyAssign } from "../../common/assign"

export const importantReducer = (state: ImportantState = importantState, action: Action): ImportantState => {
    switch (action.type) {
        case TASK_IMPORTANT_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASK_IMPORTANT_RECEIVE:
            const importantAction = action as ImportantAction
            return copyAssign(state, {
                isFetching: false,
                important: importantAction.important
            })
        case TASK_IMPORTANT_REQUEST_UPDATE:
            return copyAssign(state, { isFetching: true })
        default:
            return state
    }
}
