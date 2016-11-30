import { Action, Dispatch } from "redux"
import { State, TaskFilters } from "../types"
import { processError } from "../../common/actions/errors"
import { ApiTask, createTaskFromApiTask } from "../../../common/apitypes"
import { Task } from "../../../common/types"
import { FiltersAction, updateTasks, updateFilters } from "../../common/tasklist/actions"

export const TASKS_REQUEST = "TASKS_REQUEST"
export const TASKS_RECEIVE = "TASKS_RECEIVE"
export const TASKS_RECEIVE_FAILURE = "TASKS_RECEIVE_FAILURE"

export const requestTasks = (): Action => {
    return {
        type: TASKS_REQUEST
    }
}

export const receiveTasks = (): Action => {
    return {
        type: TASKS_RECEIVE
    }
}

export const receiveFailureTasks = (): Action => {
    return {
        type: TASKS_RECEIVE_FAILURE
    }
}

export const fetchTasks = (projectIdentifier: string, filters: TaskFilters) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestTasks())
        return fetch("/api/project/" + projectIdentifier + "/tasks").then((response: Response) => {
            return processError(response)
        }).then((apiTasks: Array<ApiTask>) => {
            const tasks = apiTasks.map((apiTask: ApiTask) => {
                return createTaskFromApiTask(apiTask)
            })
            dispatch(receiveTasks())
            dispatch(updateTasks(tasks))
            dispatch(updateFilters(filters))
        }).catch(() => {
            dispatch(receiveFailureTasks())
        })
    }
}

export const filterTasks = (projectIdentifier: string, filters: TaskFilters): FiltersAction<TaskFilters> => {
    try {
        let savedFilter = {
            notStartedChecked: filters.notStartedChecked,
            inProgressChecked: filters.inProgressChecked,
            doneChecked: filters.doneChecked,
        }
        localStorage.setItem(projectIdentifier, JSON.stringify(savedFilter))
    } catch (error) {}
    return updateFilters(filters)
}
