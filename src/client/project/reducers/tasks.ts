import { Action } from "redux"
import { TasksState, TaskFilters } from "../types"
import { MilestoneFilterMode, TaskListFilterInterface, filterTaskList } from "../../common/tasklistfilter"
import { ApiTask } from "../../../common/apitypes"
import {
    TasksAction, TaskFiltersAction, TASKS_REQUEST, TASKS_RECEIVE, TASKS_RECEIVE_FAILURE,
    TASKS_FILTER_DISPLAY
} from "../actions/tasks"
import { tasks } from "../states"
import * as dateutils from "../../../common/dateutils"
import * as latinize from "latinize"

const filterTasks = (tasks: Array<ApiTask>, filters: TaskFilters, today: Date | null): Array<ApiTask> => {
    if (!today) {
        return []
    }

    const filterInterface: TaskListFilterInterface<ApiTask> = {
        isMilestone: (task: ApiTask): boolean => {
            return task.estimatedDuration === 0
        },
        getIdentifier: (task: ApiTask): string => {
            return task.identifier
        },
        getName: (task: ApiTask): string => {
            return task.name
        }
    }

    const initialFiltered = filterTaskList(tasks, filters.filters, filterInterface)
    const todayTime = today.getTime()
    const filtered = initialFiltered.filter((task: ApiTask) => {
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
    return filtered.sort((first: ApiTask, second: ApiTask) => {
        return new Date(first.estimatedStartDate).getTime() - new Date(second.estimatedStartDate).getTime()
    })
}

export const tasksReducer = (state: TasksState = tasks, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case TASKS_RECEIVE:
            const tasksAction = action as TasksAction
            const tasks = tasksAction.tasks.sort((first: ApiTask, second: ApiTask): number => {
                const firstDate = new Date(first.estimatedStartDate).getTime()
                const secondDate = new Date(second.estimatedStartDate).getTime()
                return firstDate - secondDate
            })
            return Object.assign({}, state, {
                isFetching: false,
                tasks,
                filteredTasks: filterTasks(tasks, state.filters, state.today)
            })
        case TASKS_RECEIVE_FAILURE:
            return Object.assign({}, state, { isFetching: false })
        case TASKS_FILTER_DISPLAY:
            const taskFiltersAction = action as TaskFiltersAction
            return Object.assign({}, state, {
                filters: taskFiltersAction.filters,
                today: taskFiltersAction.today,
                filteredTasks: filterTasks(state.tasks, taskFiltersAction.filters, taskFiltersAction.today)
            })
        default:
            return state
    }
}
