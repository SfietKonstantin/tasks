import { Action } from "redux"
import { TasksState, TasksFilter } from "../types"
import { ApiTask } from "../../../common/apitypes"
import { TasksAction, TasksFilterAction, TASKS_REQUEST, TASKS_RECEIVE, TASKS_FILTER_DISPLAY } from "../actions/tasks"

const getEndDate = (task: ApiTask): Date => {
    let returned = new Date(task.startDate)
    returned.setDate(returned.getDate() + task.duration)
    return returned
}

const filterTasks = (tasks: Array<ApiTask>, filter: TasksFilter, today: Date | null): Array<ApiTask> => {
    if (!today) {
        return []
    }

    let returned = new Array<ApiTask>()
    const todayTime = today.getTime()
    const filtered = tasks.filter((task: ApiTask) => {
        if (filter.milestonesOnlyChecked && task.estimatedDuration !== 0) {
            return false
        }

        const startDate = new Date(task.startDate).getTime()
        const endDate = getEndDate(task).getTime()
        if (filter.notStartedChecked && startDate >= todayTime) {
            return true
        }
        if (filter.inProgressChecked && startDate < todayTime && endDate >= todayTime) {
            return true
        }
        if (filter.doneChecked && endDate < todayTime) {
            return true
        }
        return false
    })
    return filtered.sort((first: ApiTask, second: ApiTask) => {
        return new Date(first.estimatedStartDate).getTime() - new Date(second.estimatedStartDate).getTime()
    })
}

const initialState: TasksState = {
    isFetching: false,
    tasks: new Array<ApiTask>(),
    filter: {
        notStartedChecked: false,
        inProgressChecked: false,
        doneChecked: false,
        milestonesOnlyChecked: false
    },
    today: null,
    filteredTasks: Array<ApiTask>()
}

export const tasksReducer = (state: TasksState = initialState, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case TASKS_RECEIVE:
            const tasksAction = action as TasksAction
            return Object.assign({}, state, {
                isFetching: false,
                tasks: tasksAction.tasks,
                filteredTasks: filterTasks(tasksAction.tasks, state.filter, state.today)
            })
        case TASKS_FILTER_DISPLAY:
            const tasksFilterAction = action as TasksFilterAction
            return Object.assign({}, state, {
                filter: tasksFilterAction.filters,
                today: tasksFilterAction.today,
                filteredTasks: filterTasks(state.tasks, tasksFilterAction.filters, tasksFilterAction.today)
            })
        default:
            return state
    }
}
