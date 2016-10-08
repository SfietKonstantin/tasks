import { Project, Task, TaskResults, Modifier, Delay } from "../types"

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

export class ModifierNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message)
    }
}

export class DelayNotFoundError extends NotFoundError {
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

    getModifiers(ids: Array<number>) : Promise<Array<Modifier>>
    getModifier(id: number): Promise<Modifier>
    getTaskModifierIds(identifier: string) : Promise<Array<number>>
    getModifieredTaskIds(id: number) : Promise<Array<string>>
    addModifier(modifier: Modifier) : Promise<number>
    setModifierForTask(id: number, taskIdentifier: string) : Promise<void>
    getModifiersValues(ids: Array<number>) : Promise<Array<number>>

    getDelays(identifiers: Array<string>) : Promise<Array<Delay>>
    getDelay(identifier: string) : Promise<Delay>
    addDelay(delay: Delay) : Promise<void>
    getProjectDelays(identifier: string) : Promise<Array<Delay>>
    setDelayTaskRelation(delayIdentifier: string, taskIdentifier: string) : Promise<void>
    getTaskDelayIds(identifier: string) : Promise<Array<string>>
    getDelayTaskIds(identifier: string) : Promise<Array<string>>
} 
