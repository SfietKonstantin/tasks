import { Action } from "redux"
import { TasksState, PrimaveraTask, PrimaveraDelay } from "../types"
import {
    TasksAction,
    TASKS_IMPORT_BEGIN,
    TASKS_IMPORT_END,
    TASKS_IMPORT_INVALID_FORMAT,
    TASKS_DISMISS_INVALID_FORMAT,
    TASKS_REQUEST_ADD,
    TASKS_RECEIVE_ADD
} from "../actions/tasks"

const initialState: TasksState = {
    tasks: new Map<string, PrimaveraTask>(),
    delays: new Map<string, PrimaveraDelay>(),
    warnings: new Array<string>(),
    isImporting: false,
    invalidFormat: false
}

export const tasksReducer = (state: TasksState = initialState, action: Action): TasksState => {
    switch (action.type) {
        case TASKS_IMPORT_BEGIN:
            return Object.assign({}, state, {
                isImporting: true,
                invalidFormat: false
            })
        case TASKS_IMPORT_END:
            const taskAction = action as TasksAction
            return Object.assign({}, state, {
                tasks: taskAction.tasks,
                delays: taskAction.delays,
                warnings: taskAction.warnings,
                isImporting: false,
                invalidFormat: false
            })
        case TASKS_IMPORT_INVALID_FORMAT:
            return Object.assign({}, state, {
                tasks: new Map<string, PrimaveraTask>(),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: new Array<string>(),
                isImporting: false,
                invalidFormat: true
            })
        case TASKS_DISMISS_INVALID_FORMAT:
            return Object.assign({}, state, {
                invalidFormat: false
            })
        case TASKS_REQUEST_ADD:
            return Object.assign({}, state, {
                isImporting: true
            })
        case TASKS_RECEIVE_ADD:
            return Object.assign({}, state, {
                tasks: new Map<string, PrimaveraTask>(),
                warnings: new Array<string>(),
                isImporting: false,
                invalidFormat: true
            })
        default:
            return state
    }
}
