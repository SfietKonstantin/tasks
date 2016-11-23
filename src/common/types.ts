export interface Identifiable {
    identifier: string
}

export interface Project extends Identifiable {
    name: string
    description: string
}

export interface TaskDefinition extends Identifiable {
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number
}

export interface Task extends TaskDefinition {
    startDate: Date
    duration: number
}

export interface TaskRelation {
    previous: string
    previousLocation: TaskLocation
    next: string
    lag: number
}

export enum TaskLocation {
    Beginning,
    End
}

export interface Modifier {
    name: string
    description: string
    duration: number
    location: TaskLocation
}

export interface DelayDefinition extends Identifiable {
    name: string
    description: string
    date: Date
}

export interface DelayRelation {
    task: string
    delay: string
    lag: number
}
