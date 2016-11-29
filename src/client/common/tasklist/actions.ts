import { Action, Dispatch } from "redux"
import { State, Task, TaskListFilters } from "./types"

export const TASKS_UPDATE = "TASKS_UPDATE"
export const FILTERS_UPDATE = "FILTERS_UPDATE"

export interface TasksAction<T extends Task, F extends TaskListFilters> extends Action {
    type: string,
    tasks: Array<T>
    filters: F
}

export interface FiltersAction<T extends Task, F extends TaskListFilters> extends Action {
    type: string,
    filters: F
}

export const updateTasks = <T extends Task,
                            F extends TaskListFilters
                           >(tasks: Array<T>, filters: F): TasksAction<T, F> => {
    return {
        type: TASKS_UPDATE,
        tasks,
        filters
    }
}

export const updateFilters = <T extends Task, F extends TaskListFilters>(filters: F): FiltersAction<T, F> => {
    return {
        type: FILTERS_UPDATE,
        filters
    }
}
