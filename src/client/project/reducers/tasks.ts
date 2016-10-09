import { Action } from "redux"
import { TasksState } from "../types"
import { ApiTask } from "../../../common/apitypes"
import { TasksAction, TasksFilterAction, TASKS_REQUEST, TASKS_RECEIVE, TASKS_FILTER_DISPLAY } from "../actions/tasks"

const defaultState: TasksState = {
    tasks: new Array<ApiTask>(),
    isFetching: false,
    filters: [false, false, false],
    today: null,
    filteredTasks: new Array<ApiTask>()
}

function getEndDate(task: ApiTask) : Date {
    let returned = new Date(task.startDate)
    returned.setDate(returned.getDate() + task.duration)
    return returned
}

function filterTasks(tasks: Array<ApiTask>, filters: [boolean, boolean, boolean], today: Date) : Array<ApiTask> {
    if (!today) {
        return []
    }

    let returned = new Array<ApiTask>()
    const todayTime = today.getTime()
    const filtered = tasks.filter((task: ApiTask) => {
        // filters are "not started", "in progress", "done"
        const startDate = new Date(task.startDate).getTime()
        const endDate = getEndDate(task).getTime()
        if (filters[0] && startDate >= todayTime) {
            return true
        } 
        if (filters[1] && startDate < todayTime && endDate >= todayTime) {
            return true
        }
        if (filters[2] && endDate < todayTime) {
            return true
        }
        return false
    })
    return filtered.sort((first: ApiTask, second: ApiTask) => {
        return new Date(first.estimatedStartDate).valueOf() - new Date(second.estimatedStartDate).valueOf()
    })
}

export const tasksReducer = (state: TasksState = defaultState, action: Action) : TasksState => {
    switch (action.type) {
        case TASKS_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case TASKS_RECEIVE:
            const tasksAction = action as TasksAction
            return Object.assign({}, state, { 
                isFetching: false, 
                tasks: tasksAction.tasks,
                filteredTasks: filterTasks(tasksAction.tasks, state.filters, state.today)
            })
        case TASKS_FILTER_DISPLAY:
            const tasksFilterAction = action as TasksFilterAction
            return Object.assign({}, state, { 
                filters: tasksFilterAction.filters,
                today: tasksFilterAction.today,
                filteredTasks: filterTasks(state.tasks, tasksFilterAction.filters, tasksFilterAction.today)                
            })
        default:
            return state
    }
} 