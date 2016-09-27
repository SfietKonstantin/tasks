import { Project, Task, TaskResults, Impact } from "../types"

export class NotFoundError extends Error implements Error {
    name: string
    constructor(message: string) {
        super(message)
    }
}

export class ProjectNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message)
    }
}

export class TaskNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message)
    }
}

export class ImpactNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message)
    }
}

export class InvalidInputError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class TransactionError extends Error implements Error {
    constructor(message: string) {
        super(message)
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

    getTaskResults(id: number) : Promise<TaskResults>
    setTasksResults(results: Array<TaskResults>) : Promise<void>

    getImpacts(ids: Array<number>) : Promise<Array<Impact>>
    getImpact(id: number): Promise<Impact>
    getTaskImpactIds(id: number) : Promise<Array<number>>
    getImpactedTaskIds(id: number) : Promise<Array<number>>
    addImpact(impact: Impact) : Promise<number>
    setImpactForTask(id: number, taskId: number) : Promise<void>
    getImpactsValues(ids: Array<number>) : Promise<Array<number>>
} 
