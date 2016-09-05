import { Project, Task } from "./types"

export interface IDataProvider {
    getProjectList() : Array<Project>
    getProject(id: number) : Project
    getProjectTaskList(id: number): Array<Task>
    getTask(id: number) : Task
}