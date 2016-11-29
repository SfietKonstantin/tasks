import { Action } from "redux"
import { State, Task, TaskListFilters } from "../types"
import { FILTERS_UPDATE, FiltersAction } from "../actions/filters"
import { copyAssign } from "../../assign"

type Reducer<T extends Task, F extends TaskListFilters> = (state: State<T, F>, action: Action) => State<T, F>
type FilterFunction<T extends Task, F extends TaskListFilters> = (tasks: Array<T>, filter: F) => Array<T>

export const filtersReducer = <T extends Task,
                               F extends TaskListFilters
                              >(initialState: State<T, F>, filter: FilterFunction<T, F>): Reducer<T, F> => {
    return (state: State<T, F> = initialState, action: Action) => {
        switch (action.type) {
            case FILTERS_UPDATE:
                const filtersAction = action as FiltersAction<T, F>
                return copyAssign(state, {
                    filters: filtersAction.filters,
                    tasks: filter(filtersAction.tasks, filtersAction.filters)
                })
            default:
                return state
        }
    }
}
