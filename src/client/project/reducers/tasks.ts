import { Action } from "redux"
import { TasksState, TaskFilters } from "../types"
import { MilestoneFilterMode, filterTaskList } from "../../common/tasklistfilters"
import { Task } from "../../../common/types"
import {
    TasksAction, TaskFiltersAction, TASKS_REQUEST, TASKS_RECEIVE, TASKS_RECEIVE_FAILURE,
    TASKS_FILTER_DISPLAY
} from "../actions/tasks"
import { tasks } from "../states"
import { copyAssign } from "../../common/assign"
import * as dateutils from "../../../common/dateutils"
import * as latinize from "latinize"

const filterTasks = (tasks: Array<Task>, filters: TaskFilters, today: Date | null): Array<Task> => {
    if (!today) {
        return []
    }

    const initialFiltered = filterTaskList(tasks, filters)
    const todayTime = today.getTime()
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

export const tasksReducer = (state: TasksState = tasks, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASKS_RECEIVE:
            const tasksAction = action as TasksAction
            const tasks = tasksAction.tasks.sort((first: Task, second: Task): number => {
                return first.estimatedStartDate.getTime() - second.estimatedStartDate.getTime()
            })
            return copyAssign(state, {
                isFetching: false,
                tasks,
                filteredTasks: filterTasks(tasks, state.filters, state.today)
            })
        case TASKS_RECEIVE_FAILURE:
            return copyAssign(state, { isFetching: false })
        case TASKS_FILTER_DISPLAY:
            const taskFiltersAction = action as TaskFiltersAction
            return copyAssign(state, {
                today: taskFiltersAction.today,
                filters: taskFiltersAction.filters,
                filteredTasks: filterTasks(state.tasks, taskFiltersAction.filters, taskFiltersAction.today)
            })
        default:
            return state
    }
}
