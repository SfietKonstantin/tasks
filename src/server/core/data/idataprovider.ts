import { Project, TaskDefinition, TaskRelation, Modifier, Delay, DelayRelation } from "../../../common/types"
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

    getTask(projectIdentifier: string, taskIdentifier: string): Promise<TaskDefinition>
    getProjectTasks(projectIdentifier: string): Promise<Array<TaskDefinition>>
    addTask(projectIdentifier: string, task: TaskDefinition): Promise<void>
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean>
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void>

    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void>
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>>

    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier>
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>>
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number>
    addModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void>

    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay>
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>>
    addDelay(projectIdentifier: string, delay: Delay): Promise<void>

    addDelayRelation(projectIdentifier: string, relation: DelayRelation): Promise<void>
    getDelayRelations(projectIdentifier: string, delayIdentifier: string): Promise<Array<DelayRelation>>
}
