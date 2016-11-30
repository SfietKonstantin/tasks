import { Project } from "../../common/types"
import { Task } from "../../common/types"
import { TaskListFilters } from "../common/tasklist/types"
import * as tasklist from "../common/tasklist/types"

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
    today: Date | null
}

export type TasksTaskListState = tasklist.State<Task, TaskFilters>

export interface TasksMainState {
    isFetching: boolean
}

export interface TasksState {
    main: TasksMainState
    taskList: TasksTaskListState
}
