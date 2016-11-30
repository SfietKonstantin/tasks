import { combineReducers, Action } from "redux"
import { TasksState, TaskFilters, TasksMainState, TasksFiltersState } from "../types"
import { MilestoneFilterMode } from "../../common/tasklist/types"
import { filtersReducer } from "../../common/tasklist/reducers"
import { filterTaskList } from "../../common/tasklist/filters"
import { Task } from "../../../common/types"
import { TASKS_REQUEST, TASKS_RECEIVE, TASKS_RECEIVE_FAILURE } from "../actions/tasks"
import { tasksFilters, tasksMain } from "../states"
import { copyAssign } from "../../common/assign"
import * as dateutils from "../../../common/dateutils"
import * as latinize from "latinize"

const filterTasks = (tasks: Array<Task>, filters: TaskFilters): Array<Task> => {
    if (!filters.today) {
        return []
    }

    const initialFiltered = filterTaskList(tasks, filters)
    const todayTime = filters.today.getTime()
    const filtered = initialFiltered.filter((task: Task) => {
        const startDate = new Date(task.startDate).getTime()
        const endDate = dateutils.addDays(new Date(task.startDate), task.duration).getTime()
        if (filters.notStartedChecked && startDate >= todayTime) {
            return true
        }
        if (filters.inProgressChecked && startDate < todayTime && endDate >= todayTime) {
            return true
        }
        if (filters.doneChecked && endDate < todayTime) {
            return true
        }
        return false
    })
    return filtered.sort((first: Task, second: Task) => {
        return first.estimatedStartDate.getTime() - second.estimatedStartDate.getTime()
    })
}

const tasksFiltersReducer = filtersReducer(tasksFilters, filterTasks)

const tasksMainReducer = (state: TasksMainState = tasksMain, action: Action): TasksMainState => {
    switch (action.type) {
        case TASKS_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASKS_RECEIVE:
            return copyAssign(state, { isFetching: false })
        case TASKS_RECEIVE_FAILURE:
            return copyAssign(state, { isFetching: false })
        default:
            return state
    }
}

export const tasksReducer = combineReducers<TasksState>({
    main: tasksMainReducer,
    filters: tasksFiltersReducer
})