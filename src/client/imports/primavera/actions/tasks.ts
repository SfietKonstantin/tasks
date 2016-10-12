import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraDelay } from "../types"
import { ApiInputTask } from "../../../../common/apitypes"
import * as dateutils from "../../../../common/dateutils"

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

const convertDate = (date: string): Date | null => {
    const convertedDate = date.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/, "$2/$1/$3")
    const returned = new Date(convertedDate)
    return Number.isNaN(returned.getTime()) ? null : returned
}

const parseTasks = (reader: FileReader, dispatch: Dispatch<State>, resolve: () => void) => {
    const content: string = reader.result
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        dispatch(tasksImportInvalidFormat())
        return
    }

    splitted.shift()
    splitted.shift()

    let tasks = new Map<string, PrimaveraTask>()
    let delays = new Map<string, PrimaveraDelay>()
    let warnings = new Array<string>()
    splitted.forEach((line: string) =>  {
        const splittedLine = line.split("\t")
        if (splittedLine.length < 9) {
            return
        }

        const identifier = splittedLine[0]
        const name = splittedLine[4]
        const duration = +splittedLine[5]
        const startDate = convertDate(splittedLine[7])
        const endDate = convertDate(splittedLine[8])

        if (identifier.length === 0) {
            return
        }

        if (duration > 0 && startDate && endDate) {
            const computedDuration = dateutils.getDateDiff(startDate, endDate)
            if (duration !== computedDuration) {
                warnings.push("Task \"" + identifier + "\"'s duration do not match with the computed duration")
            }
        }

        if (tasks.has(identifier)) {
            warnings.push("Task identifier \"" + identifier + "\" is duplicated")
            return
        } 
        
        tasks.set(identifier, {
            identifier,
            name,
            startDate,
            endDate,
            duration
        })
    })

    dispatch(endTasksImport(tasks, delays, warnings))
    resolve()
}

export const importTasks = (file: File) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(beginTasksImport())
        return new Promise<void>((resolve, reject) => {
            if (file.type === "text/csv") {
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
            return !!task.startDate
        })
        return Promise.all(filteredTasks.map(((task: PrimaveraTask) => {
            const startDate = task.startDate as Date
            let inputTask: ApiInputTask = {
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
