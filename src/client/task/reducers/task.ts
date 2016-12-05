import { Action } from "redux"
import { TaskState } from "../types"
import { Project } from "../../../common/types"
import { TaskAction, TASK_REQUEST, TASK_RECEIVE, MODIFIER_REQUEST_ADD } from "../actions/task"
import { taskState } from "../states"
import { copyAssign } from "../../common/assign"

export const taskReducer = (state: TaskState = taskState, action: Action): TaskState => {
    switch (action.type) {
        case TASK_REQUEST:
            return copyAssign(state, { isFetching: true })
        case TASK_RECEIVE:
            const taskAction = action as TaskAction
            return copyAssign(state, {
                isFetching: false,
                project: taskAction.project ? taskAction.project : null,
                task: taskAction.task ? taskAction.task : null
            })
        case MODIFIER_REQUEST_ADD:
            return copyAssign(state, { isFetching: true })
        default:
            return state
    }
}
