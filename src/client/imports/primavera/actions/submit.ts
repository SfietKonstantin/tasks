import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { ErrorAction, processError } from "../../../common/actions/error"
import { Project } from "../../../../common/types"
import { ApiInputTask } from "../../../../common/apitypes"
import { InputError } from "../../../../common/errors"
import { getDateDiff } from "../../../../common/dateutils"

export const SUBMIT_REQUEST = "SUBMIT_REQUEST"
export const SUBMIT_RECEIVE = "SUBMIT_RECEIVE"
export const SUBMIT_RECEIVE_FAILURE = "SUBMIT_RECEIVE_FAILURE"

const requestSubmit = (): Action => {
    return {
        type: SUBMIT_REQUEST
    }
}

const receiveSubmit = (): Action => {
    return {
        type: SUBMIT_RECEIVE
    }
}

const receiveSubmitFailure = (message: string): ErrorAction => {
    return {
        type: SUBMIT_RECEIVE_FAILURE,
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

export const submit = (project: Project, tasks: Array<PrimaveraTask>,
                       relations: Array<PrimaveraTaskRelation>) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestSubmit())
        const inputTasks = tasks.map((task: PrimaveraTask) => {
            try {
                const dates = getDates(task)
                const returned: ApiInputTask = {
                    identifier: task.identifier,
                    name: task.name,
                    description: "",
                    estimatedStartDate: dates[0].toISOString(),
                    estimatedDuration: dates[1]
                }
                return returned
            } catch (error) {
                return null
            }
        }).filter((task: ApiInputTask | null) => {
            return task != null
        }) as Array<ApiInputTask>
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project,
                tasks: inputTasks,
                relations
            })
        }
        return fetch("/api/import", requestInit).then((response: Response) => {
            return processError(response).then(() => {
                dispatch(receiveSubmit())
            }).catch((error: Error) => {
                dispatch(receiveSubmitFailure(error.message))
            })
        })
    }
}
