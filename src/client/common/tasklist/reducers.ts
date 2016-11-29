import { Action } from "redux"
import { State, Task, TaskListFilters } from "./types"
import { TASKS_UPDATE, FILTERS_UPDATE, TasksAction,  FiltersAction } from "./actions"
import { copyAssign } from "../assign"

type Reducer<T extends Task, F extends TaskListFilters> = (state: State<T, F>, action: Action) => State<T, F>
type FilterFunction<T extends Task, F extends TaskListFilters> = (tasks: Array<T>, filter: F) => Array<T>

export const filtersReducer = <T extends Task,
                               F extends TaskListFilters
                              >(initialState: State<T, F>, filter: FilterFunction<T, F>): Reducer<T, F> => {
    return (state: State<T, F> = initialState, action: Action) => {
        switch (action.type) {
            case TASKS_UPDATE:
                const tasksAction = action as TasksAction<T>
                return copyAssign(state, {
                    tasks: tasksAction.tasks
                })
            case FILTERS_UPDATE:
                const filtersAction = action as FiltersAction<T, F>
                let returned = copyAssign(state, {
                    filters: filtersAction.filters,
                    filteredTasks: filter(state.tasks, filtersAction.filters)
                })
                return returned
            default:
                return state
        }
    }
}
