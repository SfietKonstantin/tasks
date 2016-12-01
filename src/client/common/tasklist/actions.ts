import { Action, Dispatch } from "redux"
import { State, Task, TaskListFilters } from "./types"

export const TASKS_UPDATE = "TASKS_UPDATE"
export const FILTERS_UPDATE = "FILTERS_UPDATE"
export const TASKS_PAGE_PREVIOUS = "TASKS_PAGE_PREVIOUS"
export const TASKS_PAGE_NEXT = "TASKS_PAGE_NEXT"

export interface TasksAction<T extends Task> extends Action {
    type: string,
    tasks: Array<T>
}

export interface FiltersAction<F extends TaskListFilters> extends Action {
    type: string,
    filters: F
}

export const updateTasks = <T extends Task>(tasks: Array<T>): TasksAction<T> => {
    return {
        type: TASKS_UPDATE,
        tasks
    }
}

export const updateFilters = <F extends TaskListFilters>(filters: F): FiltersAction<F> => {
    return {
        type: FILTERS_UPDATE,
        filters
    }
}

export const previousTasksPage = (): Action => {
    return {
        type: TASKS_PAGE_PREVIOUS
    }
}

export const nextTasksPage = (): Action => {
    return {
        type: TASKS_PAGE_NEXT
    }
}
