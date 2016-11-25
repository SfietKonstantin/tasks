import { TaskState } from "../types"
import { Project } from "../../../common/types"
import { TaskAction, TASK_REQUEST, TASK_RECEIVE } from "../actions/task"
import { copyAssign } from "../../common/assign"

const initialState: TaskState = {
    isFetching: false,
    project: null,
    task: null
}

export const taskReducer = (state: TaskState = initialState, action: TaskAction): TaskState => {
    switch (action.type) {
        case TASK_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASK_RECEIVE:
            return copyAssign(state, {
                isFetching: false,
                project: action.project ? action.project : null,
                task: action.task ? action.task : null
            })
        default:
            return state
    }
}
