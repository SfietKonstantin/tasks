import { Action } from "redux"
import { OverviewState } from "../types"
import { ErrorAction } from "../../../common/actions/errors"
import { TaskRelation } from "../../../../common/types"
import { ApiInputTask } from "../../../../common/apitypes"
import {
    OverviewFilterAction,
    OVERVIEW_FILTER,
    OVERVIEW_SUBMIT_REQUEST,
    OVERVIEW_SUBMIT_RECEIVE,
    OVERVIEW_SUBMIT_RECEIVE_FAILURE
} from "../actions/overview"

const initialState: OverviewState = {
    tasks: new Array<ApiInputTask>(),
    relations: Array<TaskRelation>(),
    warnings: new Map<string, Array<string>>(),
    isSubmitting: false
}

export const overviewReducer = (state: OverviewState = initialState, action: Action): OverviewState => {
    switch (action.type) {
        case OVERVIEW_FILTER:
        const overviewAction = action as OverviewFilterAction
            return Object.assign({}, state, {
                tasks: overviewAction.tasks,
                relations: overviewAction.relations,
                warnings: overviewAction.warnings
            })
        case OVERVIEW_SUBMIT_REQUEST:
            return Object.assign({}, state, {
                isSubmitting: true
            })
        case OVERVIEW_SUBMIT_RECEIVE:
            return Object.assign({}, state, {
                isSubmitting: false
            })
        case OVERVIEW_SUBMIT_RECEIVE_FAILURE:
            return Object.assign({}, state, {
                isSubmitting: false
            })
        default:
            return state
    }
}
