import { Project, Modifier } from "../../common/types"
import { ApiTask } from "../../common/apitypes"

export interface State {
    projectIdentifier: string
    taskIdentifier: string
    task: TaskState
    important: ImportantState
}

export interface TaskState {
    isFetching: boolean
    project: Project | null
    task: ApiTask | null
}

export interface ImportantState {
    isFetching: boolean
    important: boolean
}
