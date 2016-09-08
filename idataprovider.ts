import { Project, Task } from "./types"
import { TaskNode } from "./graph"

export interface IDataProvider {
    getProjectList() : Array<Project>
    getProject(id: number) : Project
    getProjectTaskList(id: number) : Array<Task>
    getProjectRootNode(id: number) : TaskNode 
    getNode(id: number) : TaskNode
}
