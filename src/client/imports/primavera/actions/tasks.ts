import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraDelay } from "../types"
import { ApiInputTask } from "../../../../common/apitypes"
import { parseTasks, InvalidFormatError } from "../import"

export const TASKS_IMPORT_BEGIN = "TASKS_IMPORT_BEGIN"
export const TASKS_IMPORT_END = "TASKS_IMPORT_END"
export const TASKS_IMPORT_INVALID_FORMAT = "TASKS_IMPORT_INVALID_FORMAT"
export const TASKS_DISMISS_INVALID_FORMAT = "TASKS_DISMISS_INVALID_FORMAT"
export const TASKS_REQUEST_ADD = "TASKS_REQUEST_ADD"
export const TASKS_RECEIVE_ADD = "TASKS_RECEIVE_ADD"

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

const requestAddTasks = (): Action => {
    return {
        type: TASKS_REQUEST_ADD
    }
}

const receiveAddTasks = (): Action => {
    return {
        type: TASKS_RECEIVE_ADD
    }
}

export const addTasks = (projectIdentifier: string, tasks: Map<string, PrimaveraTask>) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestAddTasks())
        const filteredTasks = Array.from(tasks.values()).filter((task: PrimaveraTask) => {
            return task.startDate != null
        })
        return Promise.all(filteredTasks.map(((task: PrimaveraTask) => {
            const startDate = task.startDate as Date
            const inputTask: ApiInputTask = {
                identifier: task.identifier,
                projectIdentifier,
                name: task.name,
                description: "",
                estimatedStartDate: startDate.toISOString(),
                estimatedDuration: task.duration
            }
            const requestInit: RequestInit = {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: inputTask
                })
            }
            return fetch("/api/task", requestInit)
        }))).then(() => {
            dispatch(receiveAddTasks())
        })
    }
}
