import { Project } from "../../common/types"
import { Task } from "../../common/types"
import { TaskListFilters } from "../common/tasklistfilters"

export interface State {
    projectIdentifier: string
    project: ProjectState
    tasks: TasksState
}

export interface ProjectState {
    isFetching: boolean
    project: Project | null
}

export interface TaskFilters extends TaskListFilters {
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
}

export interface TasksState {
    isFetching: boolean
    tasks: Array<Task>
    filters: TaskFilters
    today: Date | null
    filteredTasks: Array<Task>
}
