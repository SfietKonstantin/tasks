import * as latinize from "latinize"

export enum MilestoneFilterMode {
    NoFilter,
    TasksOnly,
    MilestonesOnly
}
export interface TaskListFilters {
    milestoneFilterMode: MilestoneFilterMode
    text: string
}
export interface TaskListFilterInterface<T> {
    isMilestone: (task: T) => boolean
    getIdentifier: (task: T) => string
    getName: (task: T) => string
}

export const filterTaskList = <T>(tasks: Array<T>, filters: TaskListFilters,
                                  filterInterface: TaskListFilterInterface<T>): Array<T> => {
    return tasks.filter((task: T) => {
        switch (filters.milestoneFilterMode) {
            case MilestoneFilterMode.TasksOnly:
                if (filterInterface.isMilestone(task)) {
                    return false
                }
                break
            case MilestoneFilterMode.MilestonesOnly:
                if (!filterInterface.isMilestone(task)) {
                    return false
                }
                break
            default:
                break
        }
        if (filters.text.length > 0) {
            const lowerFilter = latinize(filters.text.trim()).toLowerCase()
            const lowerIdentifier = latinize(filterInterface.getIdentifier(task).trim()).toLowerCase()
            const lowerName = latinize(filterInterface.getName(task).trim()).toLowerCase()
            if (lowerIdentifier.indexOf(lowerFilter) === -1 && lowerName.indexOf(lowerFilter) === -1) {
                return false
            }
        }

        return true
    })
}
