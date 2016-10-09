import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"

export interface State {
    identifier: string
    project: ProjectState
    tasks: TasksState
}

export interface ProjectState {
    isFetching: boolean
    project: Project
}

export interface TasksState {
    isFetching: boolean
    tasks: Array<ApiTask>
    filters: [boolean, boolean, boolean]
    today: Date
    filteredTasks: Array<ApiTask>
}