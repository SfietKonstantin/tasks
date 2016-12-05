import { Project, Modifier } from "../../common/types"
import { Task } from "../../common/types"

export interface State {
    projectIdentifier: string
    taskIdentifier: string
    task: TaskState
    important: ImportantState
}

export interface TaskState {
    isFetching: boolean
    project: Project | null
    task: Task | null
}

export interface ImportantState {
    isFetching: boolean
    important: boolean
}
