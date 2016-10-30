import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraDelay } from "../types"
import { TaskParseResults, parseTasks } from "../imports"
import { processFile } from "../../../common/actions/files"
import { ErrorAction } from "../../../common/actions/errors"

export const TASKS_IMPORT_BEGIN = "TASKS_IMPORT_BEGIN"
export const TASKS_IMPORT_END = "TASKS_IMPORT_END"
export const TASKS_IMPORT_INVALID_FORMAT = "TASKS_IMPORT_INVALID_FORMAT"
export const TASKS_DISMISS_INVALID_FORMAT = "TASKS_DISMISS_INVALID_FORMAT"

export interface TasksAction extends Action {
    type: string,
    tasks: Map<string, PrimaveraTask>
    delays: Map<string, PrimaveraDelay>
    warnings: Array<string>
}

export const beginTasksImport = (): Action => {
    return {
        type: TASKS_IMPORT_BEGIN
    }
}

export const endTasksImport = (results: TaskParseResults): TasksAction => {
    return {
        type: TASKS_IMPORT_END,
        tasks: results.tasks,
        delays: results.delays,
        warnings: results.warnings
    }
}

export const tasksImportInvalidFormat = (): ErrorAction => {
    return {
        type: TASKS_IMPORT_INVALID_FORMAT,
        message: "Invalid format for tasks CSV file"
    }
}

export const importTasks = (file: File) => {
    return processFile(file, "text/csv", parseTasks, beginTasksImport, endTasksImport, tasksImportInvalidFormat)
}

export const dismissInvalidTasksFormat = (): Action => {
    return {
        type: TASKS_DISMISS_INVALID_FORMAT
    }
}
