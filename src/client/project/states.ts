import { ProjectState, TasksState, TaskFilters } from "./types"
import { MilestoneFilterMode } from "../common/tasklistfilter"

export const project: ProjectState = {
    isFetching: false,
    project: null
}

export const filters: TaskFilters = {
    notStartedChecked: true,
    inProgressChecked: true,
    doneChecked: false,
    filters: {
        milestoneFilterMode: MilestoneFilterMode.NoFilter,
        text: ""
    }
}

export const tasks: TasksState = {
    isFetching: false,
    tasks: [],
    filters,
    today: null,
    filteredTasks: []
}
