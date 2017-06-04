import {TaskDefinition} from "../../../common/old/task"

export interface ITaskDao {
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<TaskDefinition>
    getProjectTasks(projectIdentifier: string): Promise<Array<TaskDefinition>>
    addTask(projectIdentifier: string, task: TaskDefinition): Promise<void>
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean>
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void>
}
