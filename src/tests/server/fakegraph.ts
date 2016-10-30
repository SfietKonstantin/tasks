import { ITaskNode, IProjectNode, IGraph } from "../../server/core/graph/types"
import { Project, Task, TaskResults, TaskRelation, Modifier, Delay } from "../../common/types"

export class FakeTaskNode implements ITaskNode {
    parent: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    modifiers: Array<Modifier>
    constructor(parent: IProjectNode, taskIdentifier: string, startDate: Date, duration: number) {
        this.parent = parent
        this.taskIdentifier = taskIdentifier
        this.startDate = startDate
        this.duration = duration
        this.children = []
        this.parents = []
        this.modifiers = []
    }
    addModifier(modifier: Modifier): Promise<Modifier> {
        return Promise.reject(new Error("Not mocked"))
    }
}

export class FakeProjectNode implements IProjectNode {
    parent: IGraph
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    constructor(parent: IGraph, projectIdentifier: string) {
        this.parent = parent
        this.projectIdentifier = projectIdentifier
        this.nodes = new Map<string, ITaskNode>()
    }
    addTask(task: Task): Promise<ITaskNode> {
        return Promise.reject(new Error("Not mocked"))
    }
    addRelation(relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
}

export class FakeGraph implements IGraph {
    nodes: Map<string, IProjectNode>
    constructor() {
        this.nodes = new Map<string, IProjectNode>()
    }
    addProject(project: Project): Promise<IProjectNode> {
        return Promise.reject(new Error("Not mocked"))
    }
}
