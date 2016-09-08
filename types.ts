
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

export class Impact {
    id: number
    taskId: number
    name: string
    description: string
    startDate: Date
    duration: number

    constructor(id: number, taskId: number) {
        this.id = id
        this.taskId = taskId
    }
}
