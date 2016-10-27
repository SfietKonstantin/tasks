import { Project, Task, TaskRelation, TaskResults, Modifier } from "../../../common/types"

export class GraphError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export interface ITaskNode {
    parent: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    modifiers: Array<Modifier>
    addModifier(modifier: Modifier): Promise<Modifier>
}

export interface IProjectNode {
    parent: IGraph
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    addTask(task: Task): Promise<ITaskNode>
    addRelation(relation: TaskRelation): Promise<void>
}

export interface IGraph {
    nodes: Map<string, IProjectNode>
    addProject(project: Project): Promise<IProjectNode>
}
