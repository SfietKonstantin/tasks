import { Action } from "redux"
import { TasksState, PrimaveraTask, PrimaveraDelay } from "../types"
import { tasks } from "../states"
import {
    TasksAction,
    TASKS_IMPORT_BEGIN,
    TASKS_IMPORT_END,
    TASKS_IMPORT_INVALID_FORMAT,
    TASKS_DISMISS_INVALID_FORMAT
} from "../actions/tasks"
import { copyAssign } from "../../../common/assign"

export const tasksReducer = (state: TasksState = tasks, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_IMPORT_BEGIN:
            return copyAssign(state, {
                isImporting: true,
                isInvalidFormat: false
            })
        case TASKS_IMPORT_END:
            const taskAction = action as TasksAction
            return copyAssign(state, {
                length: taskAction.length,
                tasks: taskAction.tasks,
                warnings: taskAction.warnings,
                isImporting: false,
                isInvalidFormat: false
            })
        case TASKS_IMPORT_INVALID_FORMAT:
            return copyAssign(state, {
                length: 0,
                tasks: new Map<string, PrimaveraTask>(),
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: true
            })
        case TASKS_DISMISS_INVALID_FORMAT:
            return copyAssign(state, {
                isInvalidFormat: false
            })
        default:
            return state
    }
}
