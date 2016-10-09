import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Task } from "../../../../common/types"

export const TASKS_IMPORT_BEGIN = "TASKS_IMPORT_BEGIN"
export const TASKS_IMPORT_END = "TASKS_IMPORT_END"
export const TASKS_IMPORT_INVALID_FORMAT = "TASKS_IMPORT_INVALID_FORMAT"

export interface TasksAction extends Action {
    type: string,
    isImporting: boolean
    invalidFormat: boolean
    tasks?: Array<Task>
}

function beginTasksImport() : TasksAction {
    return {
        type: TASKS_IMPORT_BEGIN,
        isImporting: true,
        invalidFormat: false
    }
}

function endTasksImport(tasks: Array<Task>) : TasksAction {
    return {
        type: TASKS_IMPORT_END,
        isImporting: false,
        invalidFormat: false,
        tasks
    }
}

function tasksImportInvalidFormat() : TasksAction {
    return {
        type: TASKS_IMPORT_INVALID_FORMAT,
        isImporting: false,
        invalidFormat: true
    }
}

function parseTasks(reader: FileReader, dispatch: Dispatch<State>, resolve: () => void) {
    const content: string = reader.result
    content.split("\n")
    console.log(content)

    dispatch(endTasksImport([]))
    resolve()
}

export const importTasks = (file: File) => {
    return function(dispatch: Dispatch<State>) {
        dispatch(beginTasksImport())
        return new Promise<void>((resolve, reject) => {
            if (file.type == "text/csv") {
                const reader = new FileReader()
                reader.onload = parseTasks.bind(reader, reader, dispatch, resolve)
                reader.readAsText(file)
            } else {
                dispatch(tasksImportInvalidFormat())
                resolve()
            }
        })
    }
}
