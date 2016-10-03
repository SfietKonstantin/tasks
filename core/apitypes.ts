import { Project, Task, TaskResults } from "./types"

export interface ApiTask {
    id: number
    project: Project
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
    startDate: string
    duration: number
}

export function createApiTask(project: Project, task: Task, taskResults: TaskResults) : ApiTask {
    return {
        id: task.id,
        project: project,
        name: task.name,
        description: task.description,
        estimatedStartDate: task.estimatedStartDate.toISOString(),
        estimatedDuration: task.estimatedDuration,
        startDate: taskResults.startDate.toISOString(),
        duration: taskResults.duration
    }
}

export function createTaskFromApiTask(apiTask: ApiTask) : Task {
    return {
        id: apiTask.id,
        projectId: apiTask.project.id,
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