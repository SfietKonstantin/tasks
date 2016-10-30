import { Action } from "redux"
import { TasksState, PrimaveraTask, PrimaveraDelay } from "../types"
import {
    TasksAction,
    TASKS_IMPORT_BEGIN,
    TASKS_IMPORT_END,
    TASKS_IMPORT_INVALID_FORMAT,
    TASKS_DISMISS_INVALID_FORMAT
} from "../actions/tasks"
import { SUBMIT_REQUEST, SUBMIT_RECEIVE } from "../actions/submit"

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
        case SUBMIT_REQUEST:
            return Object.assign({}, state, {
                isImporting: true
            })
        case SUBMIT_RECEIVE:
            return Object.assign({}, state, {
                tasks: new Map<string, PrimaveraTask>(),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: new Array<string>(),
                isImporting: false,
                invalidFormat: false
            })
        default:
            return state
    }
}
