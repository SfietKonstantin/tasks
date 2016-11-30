import { ProjectState, TasksState, TaskFilters, TasksFiltersState, TasksMainState } from "./types"
import { MilestoneFilterMode } from "../common/tasklist/types"

export const project: ProjectState = {
    isFetching: false,
    project: null
}

export const filters: TaskFilters = {
    milestoneFilterMode: MilestoneFilterMode.NoFilter,
    text: "",
    notStartedChecked: true,
    inProgressChecked: true,
    doneChecked: false,
    today: null
}

export const tasksFilters: TasksFiltersState = {
    tasks: [],
    filters,
    filteredTasks: []
}

export const tasksMain: TasksMainState = {
    isFetching: false
}

export const tasks: TasksState = {
    main: tasksMain,
    filters: tasksFilters
}
