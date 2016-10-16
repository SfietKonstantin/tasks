export interface Identifiable {
    identifier: string
}

export interface ProjectBased {
    projectIdentifier: string
}

export interface TaskBased {
    taskIdentifier: string
}

export interface Project extends Identifiable {
    name: string
    description: string
}

export interface Task extends Identifiable, ProjectBased {
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number
}

export interface TaskResults extends ProjectBased, TaskBased {
    startDate: Date
    duration: number
}

export interface Modifier extends ProjectBased {
    name: string
    description: string
    duration: number
}

export interface Delay extends Identifiable, ProjectBased {
    name: string
    description: string
    date: Date
}
