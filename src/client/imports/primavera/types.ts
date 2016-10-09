import { Project, Task } from "../../../common/types"

export interface State {
    project: Project
    tasks: TasksState
    // relations: RelationsState ???
}

export interface TasksState {
    tasks: Array<Task>
    isImporting: boolean
    invalidFormat: boolean
}