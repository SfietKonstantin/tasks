import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { RelationGraphNode } from "../graph"
import { ErrorAction, processError } from "../../../common/actions/errors"
import { Project, TaskRelation, DelayRelation } from "../../../../common/types"
import { ApiInputTask, ApiInputDelay } from "../../../../common/apitypes"
import { InputError } from "../../../../common/errors"
import { getDateDiff } from "../../../../common/dateutils"
import { mapTasks, mapDelays, filterRelations } from "../imports"

export const OVERVIEW_FILTER = "OVERVIEW_FILTER"
export const OVERVIEW_SUBMIT_REQUEST = "OVERVIEW_SUBMIT_REQUEST"
export const OVERVIEW_SUBMIT_RECEIVE = "OVERVIEW_SUBMIT_RECEIVE"
export const OVERVIEW_SUBMIT_RECEIVE_FAILURE = "OVERVIEW_SUBMIT_RECEIVE_FAILURE"

export interface OverviewFilterAction extends Action {
    type: string,
    tasks: Array<ApiInputTask>
    delays: Array<ApiInputDelay>
    taskRelations: Array<TaskRelation>
    delayRelations: Array<DelayRelation>
    warnings: Map<string, Array<string>>
}

export const filterForOverview = (tasks: Map<string, PrimaveraTask>, delays: Set<string>,
                                  relations: Map<string, RelationGraphNode>): OverviewFilterAction => {
    const relationsResults = filterRelations(tasks, delays, relations)
    return {
        type: OVERVIEW_FILTER,
        tasks: mapTasks(tasks, delays),
        delays: mapDelays(tasks, delays),
        taskRelations: relationsResults.taskRelations,
        delayRelations: relationsResults.delayRelations,
        warnings: relationsResults.warnings
    }
}

export const requestSubmit = (): Action => {
    return {
        type: OVERVIEW_SUBMIT_REQUEST
    }
}

export const receiveSubmit = (): Action => {
    return {
        type: OVERVIEW_SUBMIT_RECEIVE
    }
}

export const receiveSubmitFailure = (message: string): ErrorAction => {
    return {
        type: OVERVIEW_SUBMIT_RECEIVE_FAILURE,
        message
    }
}

export const submit = (project: Project, tasks: Array<ApiInputTask>, delays: Array<ApiInputDelay>,
                       taskRelations: Array<TaskRelation>, delayRelations: Array<DelayRelation>) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestSubmit())
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project,
                tasks,
                delays,
                taskRelations,
                delayRelations
            })
        }
        return fetch("/api/import", requestInit).then((response: Response) => {
            return processError(response)
        }).then(() => {
            dispatch(receiveSubmit())
        }).catch((error: Error) => {
            dispatch(receiveSubmitFailure(error.message))
        })
    }
}
