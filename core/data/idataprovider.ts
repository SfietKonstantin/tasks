import { Project, Task, TaskResults, Impact } from "../types"

export class NullIdentifierError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class ExistsError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error implements Error {
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
    getProject(identifier: string) : Promise<Project>
    addProject(project: Project) : Promise<void>

    hasTask(identifier: string) : Promise<void>
    getTasks(identifiers: Array<string>) : Promise<Array<Task>>
    getTask(identifier: string) : Promise<Task>
    getProjectTasks(identifier: string) : Promise<Array<Task>>
    addTask(task: Task) : Promise<void>
    setTaskRelation(parentTaskIdentifier: string, childTaskIdentifier: string) : Promise<void>
    getParentTaskIdentifiers(identifier: string) : Promise<Array<string>>
    getChildrenTaskIdentifiers(identifier: string) : Promise<Array<string>>
    isTaskImportant(identifier: string) : Promise<boolean>
    setTaskImportant(identifier: string, important: boolean) : Promise<void>

    getTasksResults(identifiers: Array<string>) : Promise<Array<TaskResults>>
    getTaskResults(identifier: string) : Promise<TaskResults>
    setTasksResults(results: Array<TaskResults>) : Promise<void>

    getImpacts(ids: Array<number>) : Promise<Array<Impact>>
    getImpact(id: number): Promise<Impact>
    getTaskImpactIds(identifier: string) : Promise<Array<number>>
    getImpactedTaskIds(id: number) : Promise<Array<string>>
    addImpact(impact: Impact) : Promise<number>
    setImpactForTask(id: number, taskIdentifier: string) : Promise<void>
    getImpactsValues(ids: Array<number>) : Promise<Array<number>>
} 
