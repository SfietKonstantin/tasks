import { Project, Task, TaskResults, Modifier, Delay } from "../../../common/types"

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

    hasTask(projectIdentifier: string, taskIdentifier: string): Promise<void>
    getTasks(projectIdentifier: string, taskIdentifiers: Array<string>): Promise<Array<Task>>
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<Task>
    getProjectTasks(projectIdentifier: string): Promise<Array<Task>>
    addTask(task: Task): Promise<void>
    setTaskRelation(projectIdentifier: string, parentTaskIdentifier: string,
                    childTaskIdentifier: string): Promise<void>
    getParentTaskIdentifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<string>>
    getChildrenTaskIdentifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<string>>
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean>
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void>

    getTasksResults(projectIdentifier: string, taskIdentifiers: Array<string>): Promise<Array<TaskResults>>
    getTaskResults(projectIdentifier: string, taskIdentifier: string): Promise<TaskResults>
    setTaskResults(taskResults: TaskResults): Promise<void>

    getModifiers(projectIdentifier: string, modifierIds: Array<number>): Promise<Array<Modifier>>
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier>
    getTaskModifierIds(projectIdentifier: string, taskIdentifier: string): Promise<Array<number>>
    getModifieredTaskIds(projectIdentifier: string, modifierId: number): Promise<Array<string>>
    addModifier(modifier: Modifier): Promise<number>
    setModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void>
    getModifiersValues(projectIdentifier: string, modifierIds: Array<number>): Promise<Array<number>>

    getDelays(projectIdentifier: string, delayIdentifiers: Array<string>): Promise<Array<Delay>>
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay>
    addDelay(delay: Delay): Promise<void>
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>>
    setDelayTaskRelation(projectIdentifier: string, delayIdentifier: string, taskIdentifier: string): Promise<void>
    getTaskDelayIds(projectIdentifier: string, taskIdentifier: string): Promise<Array<string>>
    getDelayTaskIds(projectIdentifier: string, delayIdentifier: string): Promise<Array<string>>
}
