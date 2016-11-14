export interface FakeTask {
    identifier: string
    name: string
    isMilestone: boolean
}

export const isMilestone = (task: FakeTask): boolean => {
    return task.isMilestone
}

export const getIdentifier = (task: FakeTask): string => {
    return task.identifier
}

export const getName = (task: FakeTask): string => {
    return task.name
}
