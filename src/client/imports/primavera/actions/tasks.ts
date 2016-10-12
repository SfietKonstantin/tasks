import { Action, Dispatch } from "redux"
import { State } from "../types"
import { ApiImportTask } from "../../../../common/apitypes"
import * as dateutils from "../../../../common/dateutils"

export const TASKS_IMPORT_BEGIN = "TASKS_IMPORT_BEGIN"
export const TASKS_IMPORT_END = "TASKS_IMPORT_END"
export const TASKS_IMPORT_INVALID_FORMAT = "TASKS_IMPORT_INVALID_FORMAT"
export const TASKS_DISMISS_INVALID_FORMAT = "TASKS_DISMISS_INVALID_FORMAT"
export const TASKS_REQUEST_ADD = "TASKS_REQUEST_ADD"
export const TASKS_RECEIVE_ADD = "TASKS_RECEIVE_ADD"

export interface TasksAction extends Action {
    type: string,
    tasks: Map<string, ApiImportTask>
    warnings: Array<string>
}

function beginTasksImport() : Action {
    return {
        type: TASKS_IMPORT_BEGIN
    }
}

function endTasksImport(tasks: Map<string, ApiImportTask>, warnings: Array<string>) : TasksAction {
    return {
        type: TASKS_IMPORT_END,
        tasks,
        warnings
    }
}

function tasksImportInvalidFormat() : Action {
    return {
        type: TASKS_IMPORT_INVALID_FORMAT
    }
}

function convertDate(date: string) : Date {
    const convertedDate = date.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/,"$2/$1/$3")
    const returned = new Date(convertedDate)
    return Number.isNaN(returned.getTime()) ? null : returned
}

function parseTasks(reader: FileReader, dispatch: Dispatch<State>, resolve: () => void) {
    const content: string = reader.result
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        dispatch(tasksImportInvalidFormat())
        return
    }
        
    splitted.shift()
    splitted.shift()

    let tasks = new Map<string, ApiImportTask>()
    let warnings = new Array<string>()
    splitted.forEach((line: string) =>  {
        const splittedLine = line.split("\t")
        if (splittedLine.length >= 9) {
            const identifier = splittedLine[0]
            const name = splittedLine[4]
            const duration = +splittedLine[5]
            const startDate = convertDate(splittedLine[7])
            const endDate = convertDate(splittedLine[8])

            if (duration > 0 && startDate && endDate) {
                const computedDuration = dateutils.getDateDiff(startDate, endDate)
                if (duration != computedDuration) {
                    warnings.push("Task \"" + identifier + "\"'s duration do not match with the computed duration")
                }
                    
                if (tasks.has(identifier)) {
                    warnings.push("Task identifier \"" + identifier + "\" is duplicated")
                } else {
                    tasks.set(identifier, {
                        projectIdentifier: null,
                        identifier,
                        name,
                        description: "",
                        estimatedStartDate: startDate.toISOString(),
                        estimatedDuration: duration        
                    })
                }
            }
        }
    })

    dispatch(endTasksImport(tasks, warnings))
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

export function dismissInvalidFormat () : Action {
    return {
        type: TASKS_DISMISS_INVALID_FORMAT
    }
}

function requestAddTasks() : Action {
    return {
        type: TASKS_REQUEST_ADD
    }
}

function receiveAddTasks() : Action {
    return {
        type: TASKS_RECEIVE_ADD
    }
}

export const addTasks = (projectIdentifier: string, tasks: Map<string, ApiImportTask>) => {
    return function(dispatch: Dispatch<State>) {
        dispatch(requestAddTasks())
        return Promise.all(Array.from(tasks.values(), ((task: ApiImportTask) => {
            const requestInit: RequestInit = {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: Object.assign(task, { projectIdentifier })
                })
            }
            return fetch("/api/task", requestInit)
        }))).then(() => {
            dispatch(receiveAddTasks())
        })
    }
}