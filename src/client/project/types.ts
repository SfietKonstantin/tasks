import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"

export interface State {
    projectIdentifier: string
    project: ProjectState
    tasks: TasksState
}

export interface ProjectState {
    isFetching: boolean
    project: Project | null
}

export interface TasksFilter {
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
    milestonesOnlyChecked: boolean
}

export interface TasksState {
    isFetching: boolean
    tasks: Array<ApiTask>
    filter: TasksFilter
    today: Date | null
    filteredTasks: Array<ApiTask>
}
