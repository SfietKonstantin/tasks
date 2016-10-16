import { Project, Task, TaskResults, TaskRelation, Modifier, Delay } from "../../../common/types"

export class CorruptedError extends Error implements Error {
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

export interface IDataProvider {
    getAllProjects(): Promise<Array<Project>>
    getProject(projectIdentifier: string): Promise<Project>
    addProject(project: Project): Promise<void>

    getTasks(projectIdentifier: string, taskIdentifiers: Array<string>): Promise<Array<Task | null>>
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<Task>
    getProjectTasks(projectIdentifier: string): Promise<Array<Task>>
    addTask(task: Task): Promise<void>
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean>
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void>

    addTaskRelation(relation: TaskRelation): Promise<void>
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>>

    getTaskResults(projectIdentifier: string, taskIdentifier: string): Promise<TaskResults>
    setTaskResults(taskResults: TaskResults): Promise<void>

    getModifiers(projectIdentifier: string, modifierIds: Array<number>): Promise<Array<Modifier | null>>
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier>
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>>
    getModifieredTaskIds(projectIdentifier: string, modifierId: number): Promise<Array<string>>
    addModifier(modifier: Modifier): Promise<number>
    setModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void>

    getDelays(projectIdentifier: string, delayIdentifiers: Array<string>): Promise<Array<Delay | null>>
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay>
    addDelay(delay: Delay): Promise<void>
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>>
    setDelayTaskRelation(projectIdentifier: string, delayIdentifier: string, taskIdentifier: string): Promise<void>
    getTaskDelayIds(projectIdentifier: string, taskIdentifier: string): Promise<Array<string>>
    getDelayTaskIds(projectIdentifier: string, delayIdentifier: string): Promise<Array<string>>
}
