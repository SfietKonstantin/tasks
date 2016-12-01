import { Action } from "redux"
import { State, Task, TaskListFilters } from "./types"
import {
    TASKS_UPDATE, FILTERS_UPDATE, TASKS_PAGE_PREVIOUS, TASKS_PAGE_NEXT, TasksAction,  FiltersAction
} from "./actions"
import { copyAssign } from "../assign"

type Reducer<T extends Task, F extends TaskListFilters> = (state: State<T, F>, action: Action) => State<T, F>
type FilterFunction<T extends Task, F extends TaskListFilters> = (tasks: Array<T>, filter: F) => Array<T>

const box = <T extends Task>(tasks: Array<T>, currentIndex: number, tasksPerPage: number) => {
    return tasks.filter((task: T, index: number) => {
        return index >= currentIndex * tasksPerPage && index < (currentIndex + 1) * tasksPerPage
    })
}

export const filtersReducer = <T extends Task,
                               F extends TaskListFilters
                              >(initialState: State<T, F>, filter: FilterFunction<T, F>): Reducer<T, F> => {
    return (state: State<T, F> = initialState, action: Action) => {
        switch (action.type) {
            case TASKS_UPDATE:
                const tasksAction = action as TasksAction<T>
                return copyAssign(state, {
                    tasks: tasksAction.tasks,
                    currentPage: 0,
                    maxPage: 0
                })
            case FILTERS_UPDATE:
                const filtersAction = action as FiltersAction<F>
                const filteredTasks = filter(state.tasks, filtersAction.filters)
                return copyAssign(state, {
                    filters: filtersAction.filters,
                    filteredTasks: filter(state.tasks, filtersAction.filters),
                    displayedTasks: box(filteredTasks, 0, state.tasksPerPage),
                    currentPage: 0,
                    maxPage: Math.max(0, Math.ceil(filteredTasks.length / state.tasksPerPage) - 1)
                })
            case TASKS_PAGE_PREVIOUS:
                const previousPage = Math.max(0, state.currentPage - 1)
                return copyAssign(state, {
                    displayedTasks: box(state.filteredTasks, previousPage, state.tasksPerPage),
                    currentPage: previousPage
                })
            case TASKS_PAGE_NEXT:
                const nextPage = Math.min(state.currentPage + 1, state.maxPage)
                return copyAssign(state, {
                    displayedTasks: box(state.filteredTasks, nextPage, state.tasksPerPage),
                    currentPage: nextPage
                })
            default:
                return state
        }
    }
}
