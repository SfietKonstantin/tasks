import { Project, Task, TaskResults, TaskRelation, Modifier, Delay } from "../../../common/types"
import { ExistsError, NotFoundError } from "../../../common/errors"

export class InternalError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class CorruptedError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export const isKnownError = (error: Error): boolean => {
    return error instanceof ExistsError
           || error instanceof NotFoundError
           || error instanceof CorruptedError
           || error instanceof InternalError
}

export interface IDataProvider {
    getAllProjects(): Promise<Array<Project>>
    getProject(projectIdentifier: string): Promise<Project>
    addProject(project: Project): Promise<void>

    getTask(projectIdentifier: string, taskIdentifier: string): Promise<Task>
    getProjectTasks(projectIdentifier: string): Promise<Array<Task>>
    addTask(projectIdentifier: string, task: Task): Promise<void>
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean>
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void>

    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void>
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>>

    getTaskResults(projectIdentifier: string, taskIdentifier: string): Promise<TaskResults>
    setTaskResults(projectIdentifier: string, taskIdentifier: string, taskResults: TaskResults): Promise<void>

    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier>
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>>
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number>
    setModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void>

    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay>
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>>
    addDelay(projectIdentifier: string, delay: Delay): Promise<void>
    addDelayTaskRelation(projectIdentifier: string, delayIdentifier: string, taskIdentifier: string): Promise<void>
}
