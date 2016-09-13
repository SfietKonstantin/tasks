import { Project, Task, Impact } from "../types"

export class FieldNotFoundError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export class TransactionError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export interface IDataProvider {
    getAllProjects() : Promise<Array<Project>>
    getProjects(ids: Array<number>) : Promise<Array<Project>>
    getProject(id: number) : Promise<Project>
    addProject(project: Project) : Promise<number>
    setProjectRootTask(projectId: number, taskId: number) : Promise<void>
    getProjectRootTask(projectId: number) : Promise<number>

    getTasks(ids: Array<number>) : Promise<Array<Task>>
    getTask(id: number) : Promise<Task>
    getProjectTasks(id: number) : Promise<Array<Task>>
    addTask(projectId: number, task: Task) : Promise<number>
    setTaskRelation(parentTaskId: number, childTaskId: number) : Promise<void>
    getParentTaskIds(id: number) : Promise<Array<number>>
    getChildrenTaskIds(id: number) : Promise<Array<number>>

    getImpacts(ids: Array<number>) : Promise<Array<Impact>>
    getImpact(id: number): Promise<Impact>
    getTaskImpactIds(id: number) : Promise<Array<number>>
    getImpactedTaskIds(id: number) : Promise<Array<number>>
    addImpact(impact: Impact) : Promise<number>
    setImpactForTask(id: number, taskId: number) : Promise<void>
} 
