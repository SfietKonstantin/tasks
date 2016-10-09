import { Project, Modifier } from "../../common/types"
import { ApiTask } from "../../common/apitypes"

export interface State {
    identifier: string
    task: TaskState
    important: ImportantState
}

export interface TaskState {
    isFetching: boolean
    project: Project
    task: ApiTask
}

export interface ImportantState {
    isFetching: boolean
    important: boolean    
}