import { ImportantState } from "../types"
import { Project } from "../../../common/types"
import { ImportantAction, TASK_IMPORTANT_REQUEST, TASK_IMPORTANT_RECEIVE } from "../actions/important"
import { copyAssign } from "../../common/assign"

const initialState: ImportantState = {
    isFetching: false,
    important: false
}

export const importantReducer = (state: ImportantState = initialState, action: ImportantAction): ImportantState => {
    switch (action.type) {
        case TASK_IMPORTANT_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASK_IMPORTANT_RECEIVE:
            return copyAssign(state, {
                isFetching: false,
                important: action.important
            })
        default:
            return state
    }
}
