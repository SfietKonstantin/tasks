import { Action } from "redux"
import { OverviewState, SubmitState } from "../types"
import { overview } from "../states"
import { ErrorAction } from "../../../common/actions/errors"
import { TaskRelation } from "../../../../common/types"
import { ApiInputTask, ApiInputDelay } from "../../../../common/apitypes"
import {
    OverviewFilterAction,
    OVERVIEW_FILTER,
    OVERVIEW_SUBMIT_REQUEST,
    OVERVIEW_SUBMIT_RECEIVE,
    OVERVIEW_SUBMIT_RECEIVE_FAILURE
} from "../actions/overview"
import { copyAssign } from "../../../common/assign"

export const overviewReducer = (state: OverviewState = overview, action: Action): OverviewState => {
    switch (action.type) {
        case OVERVIEW_FILTER:
            const overviewAction = action as OverviewFilterAction
            return copyAssign(state, {
                tasks: overviewAction.tasks,
                delays: overviewAction.delays,
                taskRelations: overviewAction.taskRelations,
                delayRelations: overviewAction.delayRelations,
                warnings: overviewAction.warnings
            })
        case OVERVIEW_SUBMIT_REQUEST:
            return copyAssign(state, {
                submitState: SubmitState.Submitting
            })
        case OVERVIEW_SUBMIT_RECEIVE:
            return copyAssign(state, {
                submitState: SubmitState.Submitted
            })
        case OVERVIEW_SUBMIT_RECEIVE_FAILURE:
            return copyAssign(state, {
                submitState: SubmitState.SubmitError
            })
        default:
            return state
    }
}
