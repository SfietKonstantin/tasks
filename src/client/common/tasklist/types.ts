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
    filters: F
    tasks: Array<T>
}
