import { Action, Dispatch } from "redux"
import { State } from "../types"
import { ApiTask } from "../../../common/apitypes"

export const TASKS_REQUEST = "TASKS_REQUEST"
export const TASKS_RECEIVE = "TASKS_RECEIVE"
export const TASKS_FILTER_DISPLAY = "TASKS_FILTER_DISPLAY"

export interface TasksAction extends Action {
    type: string,
    identifier: string
    tasks?: Array<ApiTask> 
}

function requestTasks(identifier: string) : TasksAction {
    return {
        type: TASKS_REQUEST,
        identifier
    }
}

function receiveTasks(identifier: string, tasks: Array<ApiTask>) : TasksAction {
    return {
        type: TASKS_RECEIVE,
        identifier,
        tasks
    }
}

export const fetchTasks = (identifier: string) => {
    return function(dispatch: Dispatch<State>) {
        dispatch(requestTasks(identifier))
        return fetch("/api/project/" + identifier + "/tasks").then((response: Response) => {
            return response.json()
        }).then((tasks: Array<ApiTask>) => {
            dispatch(receiveTasks(identifier, tasks))
        })
    }
}

export interface TasksFilterAction extends Action {
    type: string,
    filters: [boolean, boolean, boolean]
    today: Date
}

export function displayTaskFilter(notStarted: boolean, inProgress: boolean, done: boolean) : TasksFilterAction {
    return {
        type: TASKS_FILTER_DISPLAY,
        filters: [notStarted, inProgress, done],
        today: new Date()
    }
}
