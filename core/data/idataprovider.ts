import { Project, Task, Impact } from "../types"
import { TaskNode } from "../graph/graph"

export class NotFoundError extends Error implements Error {
    name: string
    constructor(name: string, message: string) {
        super(message)
        this.name = name
    }
}

export class ProjectNotFoundError extends NotFoundError {
    constructor(message: string) {
        super("ProjectNotFoundError", message)
    }
}

export class TaskNotFoundError extends NotFoundError {
    constructor(message: string) {
        super("TaskNotFoundError", message)
    }
}

export class ImpactNotFoundError extends NotFoundError {
    constructor(message: string) {
        super("ImpactNotFoundError", message)
    }
}

export class TransactionError implements Error {
    name: string
    message: string
    constructor(message: string) {
        this.name = "TransactionError"
        this.message = message
    }
}

export interface IDataProvider {
    getAllProjects() : Promise<Array<Project>>
    getProject(id: number) : Promise<Project>
    addProject(project: Project) : Promise<number>
    setProjectRootTask(projectId: number, taskId: number) : Promise<void>
    getProjectRootTask(projectId: number) : Promise<number>

    getTasks(ids: Array<number>) : Promise<Array<Task>>
    getTask(id: number) : Promise<Task>
    getProjectTasks(id: number) : Promise<Array<Task>>
    addTask(projectId: number, task: Task) : Promise<number>
    setTaskRelation(parentTaskId: number, childTaskId: number) : Promise<void>
    getParentTaskIds(id: number) : Promise<Array<number>>
    getChildrenTaskIds(id: number) : Promise<Array<number>>

    getImpacts(ids: Array<number>) : Promise<Array<Impact>>
    getImpact(id: number): Promise<Impact>
    getTaskImpactIds(id: number) : Promise<Array<number>>
    getImpactedTaskIds(id: number) : Promise<Array<number>>
    addImpact(impact: Impact) : Promise<number>
    setImpactForTask(id: number, taskId: number) : Promise<void>

    // getTree(id: number) : Promise<TaskNode>
} 
