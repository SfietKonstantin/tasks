import { Action, Dispatch } from "redux"
import { State, TaskFilters } from "../types"
import { processError } from "../../common/actions/errors"
import { ApiTask } from "../../../common/apitypes"

export const TASKS_REQUEST = "TASKS_REQUEST"
export const TASKS_RECEIVE = "TASKS_RECEIVE"
export const TASKS_RECEIVE_FAILURE = "TASKS_RECEIVE_FAILURE"
export const TASKS_FILTER_DISPLAY = "TASKS_FILTER_DISPLAY"

export interface TasksAction extends Action {
    type: string,
    tasks: Array<ApiTask>
}

export const requestTasks = (): Action => {
    return {
        type: TASKS_REQUEST
    }
}

export const receiveTasks = (tasks: Array<ApiTask>): TasksAction => {
    return {
        type: TASKS_RECEIVE,
        tasks
    }
}

export const receiveFailureTasks = (): Action => {
    return {
        type: TASKS_RECEIVE_FAILURE
    }
}

export const fetchTasks = (projectIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestTasks())
        return fetch("/api/project/" + projectIdentifier + "/tasks").then((response: Response) => {
            return processError(response)
        }).then((tasks: Array<ApiTask>) => {
            dispatch(receiveTasks(tasks))
        }).catch(() => {
            dispatch(receiveFailureTasks())
        })
    }
}

export interface TaskFiltersAction extends Action {
    type: string,
    filters: TaskFilters
    today: Date | null
}

export const filterTasks = (projectIdentifier: string, filters: TaskFilters): TaskFiltersAction => {
    try {
        let savedFilter = {
            notStartedChecked: filters.notStartedChecked,
            inProgressChecked: filters.inProgressChecked,
            doneChecked: filters.doneChecked,
        }
        localStorage.setItem(projectIdentifier, JSON.stringify(savedFilter))
    } catch (error) {}
    return {
        type: TASKS_FILTER_DISPLAY,
        filters,
        today: new Date()
    }
}
