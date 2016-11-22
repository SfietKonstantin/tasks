import { ITaskNode, IDelayNode, IProjectNode, IGraph } from "../../server/core/graph/types"
import { Project, Task, TaskRelation, Modifier, Delay, DelayRelation } from "../../common/types"

export class FakeTaskNode implements ITaskNode {
    parent: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    delays: Array<IDelayNode>
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
        return Promise.reject(new Error("FakeTaskNode: addModifier is not mocked"))
    }
}

export class FakeDelayNode implements IDelayNode {
    parent: IProjectNode
    delayIdentifier: string
    margin: number
    tasks: Array<ITaskNode>
    constructor(parent: IProjectNode, delayIdentifier: string) {
        this.parent = parent
        this.delayIdentifier = delayIdentifier
        this.margin = 0
        this.tasks = []
    }
}

export class FakeProjectNode implements IProjectNode {
    parent: IGraph
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>
    constructor(parent: IGraph, projectIdentifier: string) {
        this.parent = parent
        this.projectIdentifier = projectIdentifier
        this.nodes = new Map<string, ITaskNode>()
    }
    addTask(task: Task): Promise<ITaskNode> {
        return Promise.reject(new Error("FakeProjectNode: addTask is not mocked"))
    }
    addDelay(delay: Delay): Promise<IDelayNode> {
        return Promise.reject(new Error("FakeProjectNode: addDelay is not mocked"))
    }
    addTaskRelation(relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("FakeProjectNode: addTaskRelation is not mocked"))
    }
    addDelayRelation(relation: DelayRelation): Promise<void> {
        return Promise.reject(new Error("FakeProjectNode: addDelayRelation is not mocked"))
    }
}

export class FakeGraph implements IGraph {
    nodes: Map<string, IProjectNode>
    constructor() {
        this.nodes = new Map<string, IProjectNode>()
    }
    addProject(project: Project): Promise<IProjectNode> {
        return Promise.reject(new Error("FakeGraph: addProject is not mocked"))
    }
}
