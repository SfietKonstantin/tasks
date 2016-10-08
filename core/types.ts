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

export interface Impact {
    id: number
    name: string
    description: string
    duration: number
}
