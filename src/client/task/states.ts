import { TaskState, ImportantState } from "./types"

export const taskState: TaskState = {
    isFetching: false,
    project: null,
    task: null
}

export const importantState: ImportantState = {
    isFetching: false,
    important: false
}
