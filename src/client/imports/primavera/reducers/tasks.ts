import { Action } from "redux"
import { TasksState } from "../types"
import { Task } from "../../../../common/types"
import { TasksAction, TASKS_IMPORT_BEGIN, TASKS_IMPORT_END, TASKS_IMPORT_INVALID_FORMAT } from "../actions/tasks"

const defaultState: TasksState = {
    tasks: new Array<Task>(),
    isImporting: false,
    invalidFormat: false
}

export const tasksReducer = (state: TasksState = defaultState, action: TasksAction) : TasksState => {
    switch (action.type) {
        case TASKS_IMPORT_BEGIN:
            return Object.assign({}, state, { 
                isImporting: action.isImporting, 
                invalidFormat: action.invalidFormat
            })
        case TASKS_IMPORT_END:
            return Object.assign({}, state, { 
                tasks: action.tasks,
                isImporting: action.isImporting, 
                invalidFormat: action.invalidFormat
            })
        case TASKS_IMPORT_INVALID_FORMAT:
            return Object.assign({}, state, { 
                tasks: new Array<Task>(),
                isImporting: action.isImporting, 
                invalidFormat: action.invalidFormat
            })
        default:
            return state
    }
} 