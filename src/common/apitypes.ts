import { Project, Task, TaskResults, Modifier } from "./types"

export interface ApiTask {
    identifier: string
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

export function createApiTask(task: Task, taskResults: TaskResults) : ApiTask {
    return {
        identifier: task.identifier,
        name: task.name,
        description: task.description,
        estimatedStartDate: task.estimatedStartDate.toISOString(),
        estimatedDuration: task.estimatedDuration,
        startDate: taskResults.startDate.toISOString(),
        duration: taskResults.duration
    }
}

export function createTaskFromApiTask(project: Project, apiTask: ApiTask) : Task {
    return {
        identifier: apiTask.identifier,
        projectIdentifier: project.identifier,
        name: apiTask.name,
        description: apiTask.description,
        estimatedStartDate: new Date(apiTask.estimatedStartDate),
        estimatedDuration: apiTask.estimatedDuration
    }
}

export function createTaskResultsFromApiTask(apiTask: ApiTask) : TaskResults {
    return {
        taskIdentifier: apiTask.identifier,
        startDate: new Date(apiTask.startDate),
        duration: apiTask.duration
    }
}

export function createApiTasks(tasks: Array<Task>, tasksResults: Array<TaskResults>) : Array<ApiTask> {
    if (tasks.length == tasksResults.length) {
        let returned = new Array<ApiTask>()
        for (let i = 0; i < tasks.length; ++i) {
            returned.push(createApiTask(tasks[i], tasksResults[i]))
        }
        return returned
    } else {
        return null
    }
}