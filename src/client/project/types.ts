import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { TaskListFilters } from "../common/components/tasklist"

export interface State {
    projectIdentifier: string
    project: ProjectState
    tasks: TasksState
}

export interface ProjectState {
    isFetching: boolean
    project: Project | null
}

export interface TaskFilters {
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
    filters: TaskListFilters
}

export interface TasksState {
    isFetching: boolean
    tasks: Array<ApiTask>
    filters: TaskFilters
    today: Date | null
    filteredTasks: Array<ApiTask>
}
