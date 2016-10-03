
export interface Project {
    id: number
    name: string
    description: string
}

export interface Task {
    id: number
    projectId: number
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number
}

export interface TaskResults {
    taskId: number
    startDate: Date
    duration: number
}

export interface Impact {
    id: number
    name: string
    description: string
    duration: number
}
