export enum MilestoneFilterMode {
    NoFilter,
    TasksOnly,
    MilestonesOnly
}
export interface TaskListFilters {
    milestoneFilterMode: MilestoneFilterMode
    text: string
}

export interface Task {
    identifier: string
    name: string
    duration: number
}

export interface State<T extends Task, F extends TaskListFilters> {
    tasksPerPage: number
    filters: F
    tasks: Array<T>
    filteredTasks: Array<T>
    displayedTasks: Array<T>
    currentPage: number
    maxPage: number
}
