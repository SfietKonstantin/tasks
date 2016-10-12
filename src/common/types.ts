export interface Identifiable {
    identifier: string
}

export interface Project extends Identifiable {
    name: string
    description: string
}

export interface Task extends Identifiable {
    projectIdentifier: string
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number
}

export interface TaskResults {
    taskIdentifier: string
    startDate: Date
    duration: number
}

export interface Modifier {
    id: number
    name: string
    description: string
    duration: number
}

export interface Delay {
    projectIdentifier: string
    identifier: string
    name: string
    description: string
    date: Date
}
