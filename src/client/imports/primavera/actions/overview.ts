import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { ErrorAction, processError } from "../../../common/actions/errors"
import { Project, TaskRelation } from "../../../../common/types"
import { ApiInputTask } from "../../../../common/apitypes"
import { InputError } from "../../../../common/errors"
import { getDateDiff } from "../../../../common/dateutils"
import { filterTasks, filterRelations } from "../imports"

export const OVERVIEW_FILTER = "OVERVIEW_FILTER"
export const OVERVIEW_SUBMIT_REQUEST = "OVERVIEW_SUBMIT_REQUEST"
export const OVERVIEW_SUBMIT_RECEIVE = "OVERVIEW_SUBMIT_RECEIVE"
export const OVERVIEW_SUBMIT_RECEIVE_FAILURE = "OVERVIEW_SUBMIT_RECEIVE_FAILURE"

export interface OverviewFilterAction extends Action {
    type: string,
    tasks: Array<ApiInputTask>
    relations: Array<TaskRelation>
    warnings: Map<string, Array<string>>
}

export const filterForOverview = (tasks: Map<string, PrimaveraTask>,
                                  relations: Array<PrimaveraTaskRelation>): OverviewFilterAction => {
    const relationsResults = filterRelations(tasks, relations)
    return {
        type: OVERVIEW_FILTER,
        tasks: filterTasks(tasks),
        relations: relationsResults.relations,
        warnings: relationsResults.warnings
    }
}

const requestSubmit = (): Action => {
    return {
        type: OVERVIEW_SUBMIT_REQUEST
    }
}

const receiveSubmit = (): Action => {
    return {
        type: OVERVIEW_SUBMIT_RECEIVE
    }
}

const receiveSubmitFailure = (message: string): ErrorAction => {
    return {
        type: OVERVIEW_SUBMIT_RECEIVE_FAILURE,
        message
    }
}

const getDates = (task: PrimaveraTask): [Date, number] => {
    if (task.startDate) {
        const date = task.startDate
        if (task.endDate) {
            return [date, getDateDiff(task.endDate, date)]
        } else {
            return [date, 0]
        }
    }
    if (!task.startDate && task.endDate) {
        return [task.endDate, 0]
    }
    throw new InputError("Invalid duration")
}

export const submit = (project: Project, tasks: Array<ApiInputTask>,
                       relations: Array<TaskRelation>) => {
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
                relations
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
