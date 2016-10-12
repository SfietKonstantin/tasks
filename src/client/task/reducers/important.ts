import { ImportantState } from "../types"
import { Project } from "../../../common/types"
import { ImportantAction, TASK_IMPORTANT_REQUEST, TASK_IMPORTANT_RECEIVE } from "../actions/important"

const initialState: ImportantState = {
    isFetching: false,
    important: false
}

export const importantReducer = (state: ImportantState = initialState, action: ImportantAction): ImportantState => {
    switch (action.type) {
        case TASK_IMPORTANT_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case TASK_IMPORTANT_RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                important: action.important
            })
        default:
            return state
    }
}
