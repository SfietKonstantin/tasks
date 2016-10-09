import { TaskState } from "../types"
import { Project } from "../../../common/types"
import { TaskAction, TASK_REQUEST, TASK_RECEIVE } from "../actions/task"

const defaultState: TaskState = {
    isFetching: false,
    project: null,
    task: null
}

export const taskReducer = (state: TaskState = defaultState, action: TaskAction) : TaskState => {
    switch (action.type) {
        case TASK_REQUEST:
            return Object.assign({}, state, { isFetching: true })
        case TASK_RECEIVE:
            return Object.assign({}, state, { 
                isFetching: false, 
                project: action.project,
                task: action.task  
            })
        default:
            return state
    }
} 