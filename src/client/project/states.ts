import { ProjectState, TasksState, TaskFilters } from "./types"
import { MilestoneFilterMode } from "../common/tasklistfilters"

export const project: ProjectState = {
    isFetching: false,
    project: null
}

export const filters: TaskFilters = {
    milestoneFilterMode: MilestoneFilterMode.NoFilter,
    text: "",
    notStartedChecked: true,
    inProgressChecked: true,
    doneChecked: false
}

export const tasks: TasksState = {
    isFetching: false,
    tasks: [],
    filters,
    today: null,
    filteredTasks: []
}
