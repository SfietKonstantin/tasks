
export class Project {
    id: number
    name: string
    description: string

    constructor(id: number) {
        this.id = id
    }
}

export class Task {
    id: number
    projectId: number
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number

    constructor(id: number, projectId: number) {
        this.id = id
        this.projectId = projectId
    }
}

export class TaskResults {
    taskId: number
    startDate: Date
    duration: number
    constructor(taskId: number, startDate: Date, duration: number) {
        this.taskId = taskId
        this.startDate = startDate
        this.duration = duration
    }
}

export class Impact {
    id: number
    name: string
    description: string
    duration: number

    constructor(id: number) {
        this.id = id
    }
}
