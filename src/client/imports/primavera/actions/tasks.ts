import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraDelay } from "../types"
import { parseTasks, InvalidFormatError } from "../import"

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

const beginTasksImport = (): Action => {
    return {
        type: TASKS_IMPORT_BEGIN
    }
}

const endTasksImport = (tasks: Map<string, PrimaveraTask>, delays: Map<string, PrimaveraDelay>,
                        warnings: Array<string>): TasksAction => {
    return {
        type: TASKS_IMPORT_END,
        tasks,
        delays,
        warnings
    }
}

const tasksImportInvalidFormat = (): Action => {
    return {
        type: TASKS_IMPORT_INVALID_FORMAT
    }
}

const doParseTasks = (reader: FileReader, dispatch: Dispatch<State>, resolve: () => void,
                      reject: (reason: any) => void) => {
    try {
        const results = parseTasks(reader.result)
        dispatch(endTasksImport(results.tasks, results.delays, results.warnings))
        resolve()
    }
    catch (e) {
        if (e instanceof InvalidFormatError) {
            dispatch(tasksImportInvalidFormat())
            resolve()
        } else {
            reject(e)
        }
    }
}

export const importTasks = (file: File) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(beginTasksImport())
        return new Promise<void>((resolve, reject) => {
            if (file.type === "text/csv") {
                const reader = new FileReader()
                reader.onload = doParseTasks.bind(reader, reader, dispatch, resolve, reject)
                reader.readAsText(file)
            } else {
                dispatch(tasksImportInvalidFormat())
                resolve()
            }
        })
    }
}

export const dismissInvalidTasksFormat = (): Action => {
    return {
        type: TASKS_DISMISS_INVALID_FORMAT
    }
}
