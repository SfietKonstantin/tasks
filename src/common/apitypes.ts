import {
    Identifiable, ProjectBased,
    Project, Task, TaskResults, Modifier
} from "./types"

export interface ApiInputTask extends Identifiable, ProjectBased {
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
}

export interface ApiTask extends Identifiable, ProjectBased {
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
    startDate: string
    duration: number
}

export interface ApiProjectTaskModifiers {
    project: Project
    task: ApiTask
    modifiers: Array<Modifier>
}

export const createTaskFromApiImportTask = (apiImportTask: ApiInputTask): Task => {
    return {
        identifier: apiImportTask.identifier,
        projectIdentifier: apiImportTask.projectIdentifier,
        name: apiImportTask.name,
        description: apiImportTask.description,
        estimatedStartDate: new Date(apiImportTask.estimatedStartDate),
        estimatedDuration: apiImportTask.estimatedDuration
    }
}

export const createApiTask = (task: Task, taskResults: TaskResults): ApiTask => {
    return {
        projectIdentifier: task.projectIdentifier,
        identifier: task.identifier,
        name: task.name,
        description: task.description,
        estimatedStartDate: task.estimatedStartDate.toISOString(),
        estimatedDuration: task.estimatedDuration,
        startDate: taskResults.startDate.toISOString(),
        duration: taskResults.duration
    }
}

export const createTaskFromApiTask = (project: Project, apiTask: ApiTask): Task => {
    return {
        projectIdentifier: project.identifier,
        identifier: apiTask.identifier,
        name: apiTask.name,
        description: apiTask.description,
        estimatedStartDate: new Date(apiTask.estimatedStartDate),
        estimatedDuration: apiTask.estimatedDuration
    }
}

export const createTaskResultsFromApiTask = (apiTask: ApiTask): TaskResults => {
    return {
        projectIdentifier: apiTask.projectIdentifier,
        taskIdentifier: apiTask.identifier,
        startDate: new Date(apiTask.startDate),
        duration: apiTask.duration
    }
}

export const createApiTasks = (tasks: Array<Task>, tasksResults: Array<TaskResults>): Array<ApiTask> | null => {
    if (tasks.length === tasksResults.length) {
        let returned = new Array<ApiTask>()
        for (let i = 0; i < tasks.length; ++i) {
            returned.push(createApiTask(tasks[i], tasksResults[i]))
        }
        return returned
    } else {
        return null
    }
}
