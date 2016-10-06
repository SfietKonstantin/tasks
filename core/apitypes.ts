import { Project, Task, TaskResults } from "./types"

export interface ApiTask {
    id: number
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
    startDate: string
    duration: number
}

export interface ApiProjectAndTask {
    project: Project
    task: ApiTask
}

export interface ApiProjectAndTasks {
    project: Project
    tasks: Array<ApiTask> 
}

export function createApiTask(task: Task, taskResults: TaskResults) : ApiTask {
    return {
        id: task.id,
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
        id: apiTask.id,
        projectId: project.id,
        name: apiTask.name,
        description: apiTask.description,
        estimatedStartDate: new Date(apiTask.estimatedStartDate),
        estimatedDuration: apiTask.estimatedDuration
    }
}

export function createTaskResultsFromApiTask(apiTask: ApiTask) : TaskResults {
    return {
        taskId: apiTask.id,
        startDate: new Date(apiTask.startDate),
        duration: apiTask.duration
    }
}

export function createApiProjectAndTasks(project: Project, tasks: Array<Task>, tasksResults: Array<TaskResults>) : ApiProjectAndTasks {
    if (tasks.length == tasksResults.length) {
        let apiTasks = new Array<ApiTask>()
        for (let i = 0; i < tasks.length; ++i) {
            apiTasks.push(createApiTask(tasks[i], tasksResults[i]))
        }
        return {
            project: project,
            tasks: apiTasks
        }
    } else {
        return null
    }
}