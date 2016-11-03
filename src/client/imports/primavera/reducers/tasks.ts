import { Action } from "redux"
import { TasksState, PrimaveraTask, PrimaveraDelay } from "../types"
import {
    TasksAction,
    TASKS_IMPORT_BEGIN,
    TASKS_IMPORT_END,
    TASKS_IMPORT_INVALID_FORMAT,
    TASKS_DISMISS_INVALID_FORMAT
} from "../actions/tasks"

const initialState: TasksState = {
    length: 0,
    tasks: new Map<string, PrimaveraTask>(),
    delays: new Map<string, PrimaveraDelay>(),
    warnings: new Map<string, Array<string>>(),
    isImporting: false,
    isInvalidFormat: false
}

export const tasksReducer = (state: TasksState = initialState, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_IMPORT_BEGIN:
            return Object.assign({}, state, {
                isImporting: true,
                isInvalidFormat: false
            })
        case TASKS_IMPORT_END:
            const taskAction = action as TasksAction
            return Object.assign({}, state, {
                length: taskAction.length,
                tasks: taskAction.tasks,
                delays: taskAction.delays,
                warnings: taskAction.warnings,
                isImporting: false,
                isInvalidFormat: false
            })
        case TASKS_IMPORT_INVALID_FORMAT:
            return Object.assign({}, state, {
                length: 0,
                tasks: new Map<string, PrimaveraTask>(),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: true
            })
        case TASKS_DISMISS_INVALID_FORMAT:
            return Object.assign({}, state, {
                isInvalidFormat: false
            })
        default:
            return state
    }
}
